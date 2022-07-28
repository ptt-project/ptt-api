import { Command, Console } from 'nestjs-console'

@Console()
export class AppConsoleService {
  @Command({
    command: 'test-console',
    description: 'test for first command',
  })
  helloWorld() {
    console.log('hello world !!')
  }
}
