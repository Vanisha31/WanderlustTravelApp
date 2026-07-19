import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';

const processes = [
  spawn(npmCommand, ['run', 'dev:server'], { stdio: 'inherit', shell: false }),
  spawn(npmCommand, ['run', 'dev:client'], { stdio: 'inherit', shell: false })
];

function shutdown() {
  for (const child of processes) {
    if (!child.killed) child.kill();
  }
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});
