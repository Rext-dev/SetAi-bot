export type CommandHandler = (
  args: string[]
) => Promise<string | undefined> | string | undefined;

import { sumar } from "../utils/math.js";

const commands: Record<string, CommandHandler> = {
  sumar: (args: string[]) => {
    const nums = args.map(Number);
    if (nums.length < 2 || nums.some(Number.isNaN)) {
      return "Uso: !sumar <num1> <num2> [...nums]";
    }
    return `Resultado: ${sumar(nums)}`;
  },
};

export function getCommand(name: string): CommandHandler | undefined {
  return commands[name.toLowerCase()];
}
