import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Pet, User, Role } from '@prisma/client';

@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: {
      name: string;
      species: string;
      breed?: string;
      birthDate?: Date;
    },
    ownerId: string,
  ): Promise<Pet> {
    return this.prisma.pet.create({
      data: {
        ...data,
        owner: {
          connect: { id: ownerId },
        },
      },
      include: {
        owner: true,
        healthRecords: true,
      },
    });
  }

  async findAll(user: User): Promise<Pet[]> {
    if (user.role === Role.ADMIN || user.role === Role.EMPLOYEE) {
      return this.prisma.pet.findMany({
        include: {
          owner: true,
          healthRecords: true,
        },
      });
    }

    return this.prisma.pet.findMany({
      where: {
        ownerId: user.id,
      },
      include: {
        owner: true,
        healthRecords: true,
      },
    });
  }

  async findOne(id: string, user: User): Promise<Pet> {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
      include: {
        owner: true,
        healthRecords: true,
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (
      user.role !== Role.ADMIN &&
      user.role !== Role.EMPLOYEE &&
      pet.ownerId !== user.id
    ) {
      throw new ForbiddenException('You do not have access to this pet');
    }

    return pet;
  }

  async update(
    id: string,
    data: {
      name?: string;
      species?: string;
      breed?: string;
      birthDate?: Date;
    },
    user: User,
  ): Promise<Pet> {
    await this.verifyPetAccess(id, user);

    return this.prisma.pet.update({
      where: { id },
      data,
      include: {
        owner: true,
        healthRecords: true,
      },
    });
  }

  async remove(id: string, user: User): Promise<void> {
    await this.verifyPetAccess(id, user);

    await this.prisma.pet.delete({
      where: { id },
    });
  }

  async addHealthRecord(
    petId: string,
    data: {
      type: string;
      description: string;
      date: Date;
    },
    user: User,
  ) {
    await this.verifyPetAccess(petId, user);

    return this.prisma.healthRecord.create({
      data: {
        ...data,
        pet: {
          connect: { id: petId },
        },
      },
    });
  }

  async getHealthRecords(petId: string, user: User) {
    await this.verifyPetAccess(petId, user);

    return this.prisma.healthRecord.findMany({
      where: {
        petId,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  private async verifyPetAccess(petId: string, user: User): Promise<void> {
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (
      user.role !== Role.ADMIN &&
      user.role !== Role.EMPLOYEE &&
      pet.ownerId !== user.id
    ) {
      throw new ForbiddenException('You do not have access to this pet');
    }
  }
}
