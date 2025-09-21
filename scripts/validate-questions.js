#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateJSONQuestions() {
  log('cyan', '\n🔍 Validating JSON question files...');
  
  const questionsDir = path.join(__dirname, '../src/shared/questions');
  const files = fs.readdirSync(questionsDir).filter(f => f.endsWith('.json'));
  
  let totalQuestions = 0;
  let errors = 0;
  
  for (const file of files) {
    const filePath = path.join(questionsDir, file);
    log('blue', `\n📁 Validating ${file}...`);
    
    try {
      // Проверяем, что файл является валидным JSON
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Проверяем, что это массив вопросов или объект с массивом questions
      let questions;
      if (Array.isArray(content)) {
        questions = content;
      } else if (content.questions && Array.isArray(content.questions)) {
        questions = content.questions;
      } else {
        log('red', `❌ Error: ${file} does not contain questions array`);
        errors++;
        continue;
      }
      totalQuestions += questions.length;
      log('green', `✅ Found ${questions.length} questions`);
      
      // Проверяем каждую структуру вопроса
      const requiredFields = ['id', 'title', 'category', 'difficulty', 'bucket', 'prompt', 'answer'];
      const duplicateIds = new Set();
      const allIds = new Set();
      
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionNum = i + 1;
        
        // Проверяем обязательные поля
        for (const field of requiredFields) {
          if (!question[field] && question[field] !== 0) {
            log('red', `❌ Question ${questionNum}: Missing required field '${field}'`);
            errors++;
          }
        }
        
        // Проверяем уникальность ID
        if (question.id) {
          if (allIds.has(question.id)) {
            log('red', `❌ Question ${questionNum}: Duplicate ID '${question.id}'`);
            errors++;
          }
          allIds.add(question.id);
        }
        
        // Проверяем длину ответа
        if (question.answer && question.answer.length < 10) {
          log('yellow', `⚠️ Question ${questionNum}: Very short answer (${question.answer.length} chars)`);
        }
        
        // Проверяем длину вопроса
        if (question.prompt && question.prompt.length < 10) {
          log('yellow', `⚠️ Question ${questionNum}: Very short prompt (${question.prompt.length} chars)`);
        }
        
        // Проверяем пустые поля
        if (question.answer === '' || question.answer === null) {
          log('red', `❌ Question ${questionNum}: Empty answer`);
          errors++;
        }
        
        if (question.prompt === '' || question.prompt === null) {
          log('red', `❌ Question ${questionNum}: Empty prompt`);
          errors++;
        }
        
        // Проверяем валидность difficulty
        if (question.difficulty && (question.difficulty < 1 || question.difficulty > 4)) {
          log('red', `❌ Question ${questionNum}: Invalid difficulty ${question.difficulty} (should be 1-4)`);
          errors++;
        }
        
        // Проверяем валидность bucket
        if (question.bucket && !['screening', 'deep', 'architecture'].includes(question.bucket)) {
          log('red', `❌ Question ${questionNum}: Invalid bucket '${question.bucket}' (should be screening/deep/architecture)`);
          errors++;
        }
      }
      
    } catch (error) {
      log('red', `❌ Error parsing ${file}: ${error.message}`);
      errors++;
    }
  }
  
  return { totalQuestions, errors };
}

function validateMarkdownQuestions() {
  log('cyan', '\n🔍 Validating Markdown question files...');
  
  const mdDir = path.join(__dirname, '../src/shared/questions/md');
  let totalQuestions = 0;
  let errors = 0;
  
  if (!fs.existsSync(mdDir)) {
    log('yellow', 'ℹ️ No Markdown questions directory found');
    return { totalQuestions, errors };
  }
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.md')) {
        log('blue', `\n📁 Validating ${path.relative(mdDir, filePath)}...`);
        totalQuestions++;
        
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Проверяем frontmatter
          if (!content.startsWith('---')) {
            log('red', `❌ Error: File does not start with frontmatter (---)`);
            errors++;
            continue;
          }
          
          // Проверяем наличие секций
          if (!content.includes('## Вопрос')) {
            log('red', `❌ Error: Missing '## Вопрос' section`);
            errors++;
          }
          
          if (!content.includes('## Ответ')) {
            log('red', `❌ Error: Missing '## Ответ' section`);
            errors++;
          }
          
          // Проверяем frontmatter поля
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            const requiredFields = ['id', 'title', 'category', 'difficulty', 'bucket'];
            
            for (const field of requiredFields) {
              if (!frontmatter.includes(`${field}:`)) {
                log('red', `❌ Error: Missing frontmatter field '${field}'`);
                errors++;
              }
            }
          }
          
          log('green', '✅ Valid Markdown question');
          
        } catch (error) {
          log('red', `❌ Error reading file: ${error.message}`);
          errors++;
        }
      }
    }
  }
  
  walkDir(mdDir);
  return { totalQuestions, errors };
}

function generateReport(jsonStats, mdStats) {
  log('cyan', '\n📊 Validation Report');
  log('cyan', '==================');
  
  const totalQuestions = jsonStats.totalQuestions + mdStats.totalQuestions;
  const totalErrors = jsonStats.errors + mdStats.errors;
  
  log('blue', `📈 Total questions: ${totalQuestions}`);
  log('blue', `📁 JSON questions: ${jsonStats.totalQuestions}`);
  log('blue', `📝 Markdown questions: ${mdStats.totalQuestions}`);
  
  if (totalErrors === 0) {
    log('green', '\n✅ All validations passed!');
    log('green', '🎉 Ready for commit!');
  } else {
    log('red', `\n❌ Found ${totalErrors} errors`);
    log('red', '🔧 Please fix errors before committing');
    process.exit(1);
  }
}

// Главная функция
function main() {
  log('bright', '🚀 SkillCheck Question Validator');
  log('bright', '================================');
  
  const jsonStats = validateJSONQuestions();
  const mdStats = validateMarkdownQuestions();
  
  generateReport(jsonStats, mdStats);
}

// Запуск
main();
