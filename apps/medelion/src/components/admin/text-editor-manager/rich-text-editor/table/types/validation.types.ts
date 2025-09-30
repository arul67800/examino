export type ValidationType = 'required' | 'email' | 'url' | 'pattern' | 'range' | 'length' | 'date' | 'number' | 'custom';
export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationRule {
  type: ValidationType;
  message: string;
  severity: ValidationSeverity;
  rule: any;
  condition?: (value: any, row: any, table: any) => boolean;
  async?: boolean;
  debounce?: number;
}

export interface CellValidation {
  rules: ValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  showInlineErrors?: boolean;
  showTooltipErrors?: boolean;
  customValidator?: (value: any, cell: any, row: any, table: any) => Promise<ValidationResult> | ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  infos: ValidationError[];
}

export interface ValidationError {
  rule: string;
  message: string;
  severity: ValidationSeverity;
  field?: string;
  value?: any;
  code?: string;
}

export interface ValidationConfig {
  enabled: boolean;
  mode: 'strict' | 'lenient' | 'silent';
  showErrors: boolean;
  showWarnings: boolean;
  showInfos: boolean;
  preventInvalidInput: boolean;
  highlightInvalidCells: boolean;
  customValidators: { [key: string]: (value: any) => ValidationResult };
  asyncValidators: { [key: string]: (value: any) => Promise<ValidationResult> };
  debounceTime: number;
  maxErrors: number;
  errorStyles: {
    borderColor: string;
    backgroundColor: string;
    textColor: string;
    iconColor: string;
  };
  warningStyles: {
    borderColor: string;
    backgroundColor: string;
    textColor: string;
    iconColor: string;
  };
}