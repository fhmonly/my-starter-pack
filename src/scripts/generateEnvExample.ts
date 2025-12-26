import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');

const example = env
    .split('\n')
    .map((line) => {
        if (line.trim().startsWith('#') || !line.includes('=')) return line;
        return line.split('=')[0] + '=';
    })
    .join('\n');

fs.writeFileSync('.env.example', example);

console.log('.env.example created!');
