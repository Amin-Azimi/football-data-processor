import { ZodType } from "zod";

export const ValidateSchema = async <TData, T extends ZodType = ZodType>(
  zodSchema: T,
  data: string | null,
): Promise<
  | {
      success: true;
      data: TData;
    }
  | { success: false; error: string }
> => {
  try {
    const parsedBody = JSON.parse(data ?? "");
    const validationResult = await zodSchema.safeParseAsync(parsedBody);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");

      return { success: false, error: errorMessages };
    }

    return { success: true, data: validationResult.data };
  } catch (e) {
    return { success: false, error: `Invalid JSON format: ${e}` };
  }
};
