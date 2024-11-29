import { CustomError, CustomResponse, CustomSuccess } from "@kit/shared/response";

// Helper function to check if a property exists and has a specific type
function hasProperty<T>(obj: unknown, prop: string, type: string): obj is T {
  return typeof obj === 'object' && obj !== null && typeof (obj as unknown as Record<string, unknown>)[prop] === type;  
}

// Type guard for CustomError
export function isCustomError(obj: unknown): obj is CustomError {
  return (
    hasProperty<CustomError>(obj, 'status', 'number') &&
    hasProperty<CustomError>(obj, 'message', 'string') &&  
    'statusText' in obj &&
    // 'operationName' in obj &&
    'data' in obj
  );
}

// Type guard for CustomSuccess
export function isCustomSuccess(obj: unknown): obj is CustomSuccess {
  return (
    hasProperty<CustomSuccess>(obj, 'status', 'number') &&
    'statusText' in obj &&
    'message' in obj &&
    // 'operationName' in obj &&
    'data' in obj
  );
} 

// Type guard for CustomResponse
export function isCustomResponse(obj: unknown): obj is CustomResponse {
  return (
    hasProperty<CustomResponse>(obj, 'ok', 'boolean')
    && hasProperty<CustomResponse>(obj, 'error', 'object')
    && hasProperty<CustomResponse>(obj, 'success', 'object')
  );
}