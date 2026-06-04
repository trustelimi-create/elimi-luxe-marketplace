import { Generator, getConfig } from '@tanstack/router-generator';
const config = await getConfig({}, process.cwd());
const g = new Generator({ config, root: process.cwd() });
await g.run();
console.log('done');
