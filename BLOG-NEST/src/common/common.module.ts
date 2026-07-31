import { Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptsHashingService } from './hashing/bcrypt-hasing.service';

@Module({
  providers: [
    {
      provide: HashingService,
      useClass: BcryptsHashingService,
    },
  ],
  exports: [HashingService],
})
export class CommonModule {}
