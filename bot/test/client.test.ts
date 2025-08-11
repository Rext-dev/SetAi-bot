import { createClient } from '../src/services/client';
import { getCommand } from '../src/commands';

jest.mock('../src/commands', () => {
  return {
    getCommand: jest.fn().mockImplementation((name: string) => {
      if (name === 'sumar') return (args: string[]) => `Resultado: ${args.map(Number).reduce((a,b)=>a+b,0)}`;
      return undefined;
    })
  };
});

describe('createClient', () => {
  it('crea cliente y responde a comando', async () => {
    const client: any = createClient();
    const readyCb = jest.fn();
    client.once('ready', readyCb);
    // Simular ready
    (client as any).emit('ready');
    expect(readyCb).toHaveBeenCalled();

    const messageReply = jest.fn();
    const msg: any = {
      author: { bot: false },
      content: '!sumar 1 2',
      reply: messageReply
    };
    (client as any).emit('messageCreate', msg);
    expect(getCommand).toHaveBeenCalledWith('sumar');
    // reply async
    await Promise.resolve();
    expect(messageReply).toHaveBeenCalledWith('Resultado: 3');
  });

  it('ignora mensajes de bots y sin prefijo', () => {
    const client: any = createClient();
    const reply = jest.fn();
    (client as any).emit('messageCreate', { author: { bot: true }, content: '!sumar 1 2', reply });
    (client as any).emit('messageCreate', { author: { bot: false }, content: 'sumar 1 2', reply });
    expect(reply).not.toHaveBeenCalled();
  });
});
