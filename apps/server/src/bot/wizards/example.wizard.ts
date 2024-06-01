import { OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { Context, Wizard, WizardStep } from 'nestjs-telegraf';

@Wizard('application')
export class ApplicationWizard {
  
}
