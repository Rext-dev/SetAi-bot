import { IModelService, ModelOption } from "../types/bot.types";

export class ModelService implements IModelService {
  private readonly models: ModelOption[] = [
    { name: "Gemini 2.5 flash lite", value: "gemini-2.5-flash-lite" },
  ];

  private readonly defaultModel: ModelOption = this.models[0];

  public getAvailableModels(): ModelOption[] {
    return [...this.models];
  }

  public getDefaultModel(): string {
    return this.defaultModel.value;
  }

  public isValidModel(modelValue: string): boolean {
    return this.models.some((model) => model.value === modelValue);
  }
}
