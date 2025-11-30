#!/usr/bin/env node

import { Command } from 'commander';
import { X402AIClient } from './client';
import { validateEnvironment } from './config';

const program = new Command();

program
  .name('x402-pay')
  .description('X402 AI Service CLI')
  .version('1.0.0');

program
  .command('chat')
  .description('Get an AI chat response with x402 payment')
  .option('--message <message>', 'Message to send to AI', 'Hello AI')
  .action(async (options) => {
    try {
      validateEnvironment();
      console.log('Starting X402-compliant AI chat...');
      console.log(`Message: "${options.message}"`);
      console.log(`This will require payment for AI response (0.001 USDC)`);

      const x402Client = new X402AIClient();

      const response = await x402Client.getChatCompletion([
        { role: 'user', content: options.message }
      ]);

      console.log('\nAI Response:');
      console.log('----------------------------------------');
      console.log(response.content);
      console.log('----------------------------------------');

    } catch (error) {
      console.error('Chat failed:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program.parse();
