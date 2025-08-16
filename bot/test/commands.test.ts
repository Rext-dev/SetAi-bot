import { getCommand } from '../src/commands';

describe('comando sumar', () => {
  it('suma números y devuelve el mensaje formateado', async () => {
    const cmd = getCommand('sumar');
    expect(cmd).toBeDefined();
    const out = await cmd!(['1', '2', '3']);
    expect(out).toBe('Resultado: 6');
  });

  it('valida argumentos inválidos', async () => {
    const cmd = getCommand('sumar');
    const out = await cmd!(['a', '2']);
    expect(out).toMatch(/Uso: !sumar/);
  });
});
