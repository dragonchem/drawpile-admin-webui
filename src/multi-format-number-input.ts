import { html, nothing, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { DrawpileElement, RenderResult } from "./element";

export interface FormatOption {
  label: string;
  weight: number;
}

@customElement("multi-format-number-input")
export class PageControls extends DrawpileElement {
  @property() min: number = -9999999999999999999;
  @property() max: number = 9999999999999999999;
  @property() step: string = "1";
  @property() formats: FormatOption[] = [];
  @property() submitting: boolean = false;
  @property() invalid: boolean = false;
  @property() set initialValue(value: number) {
    const val = parseInt(value as any);

    if (typeof this.formats === "string") {
      this.formats = JSON.parse(this.formats);
    }

    if (val < this.min) {
      this._value = parseInt(this.min as any);
    } else if (val > this.max) {
      this._value = parseInt(this.max as any);
    } else {
      this._value = parseInt(value as any);
    }

    if (this._value === 0) {
        this._format = 0;
        this._displayValue = 0;
        return;
    }
    const selectedFormat = this.formats.sort((a, b) => b.weight - a.weight).find(
      (format) => {
        console.log(val % format.weight, format);
        return val % format.weight === 0
      }
    );

    if (selectedFormat?.weight === 0) {
      this._format = 0;
      this._displayValue = 0;
    }

    if (selectedFormat) {
      this._format = selectedFormat.weight;
      this._displayValue = val / selectedFormat.weight;
    } else {
      this._format = this.formats[0]?.weight || 0;
      this._displayValue = val;
    }
  }
  @state() _format: number = 0;
  get format(): number {
    return this._format;
  }
  set format(value: number) {
    const prevFormat = this._format;
    this._format = parseInt(value as any);
    if (this.format <= 0) {
      this.value = 0;
      this._displayValue = 0;
      return;
    }

    this._displayValue = this._displayValue * prevFormat / this._format;
  }
  @state() _value: number = 0;
  get value(): number {
    return this._value;
  }
  set value(value: number) {
    if (value < this.min) {
      this._value = parseInt(this.min as any);
    } else if (value > this.max) {
      this._value = parseInt(this.max as any);
    } else {
      this._value = parseInt(value as any);
    }
    const event = new CustomEvent<number>("change", {
      detail: this._value,
    });
    this.dispatchEvent(event);
  }
  @state() _displayValue: number = 0;
  get displayValue(): number {
    return this._displayValue;
  }
  set displayValue(value: number) {
    this._displayValue = parseInt(value as any);

    const selectedFormat = this.formats.find(
      (format) => format.weight === this.format
    );
    if (!selectedFormat) {
      return;
    }

    if (this.format < 0) this.value = 0;
    this.value = value * selectedFormat.weight;
  }

  override connectedCallback(): void {
    super.connectedCallback();

    if (typeof this.formats === "string") {
      this.formats = JSON.parse(this.formats);
    }
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);
  }

  protected override render(): RenderResult {
    const result = html`
    <div class="double-input">
      ${this.renderInput()}
      <select
        .value=${this.format}
        @change="${this.bindSelect("format")}"
        >
        ${this.renderSelectOptions()}
      </select>
      </div>
    `;
    return result;
  }

  private renderInput() {
    if (this.format <= 0) {
      return "";
    }
    return html`<input
      .value=${this.displayValue}
      @change="${this.bindInput("displayValue")}"
      @keyup="${this.bindInput("displayValue")}"
      readonly="${this.submitting || nothing}"
      aria-invalid="${this.invalid || nothing}"
      type="number"
      min="${this.min}"
      max="${this.max}"
      step="${this.step}"
      required
      autofocus
    />`;
  }

  private renderSelectOptions() {
    return this.formats.sort((a, b) => a.weight - b.weight).map((format) => {
      return html` <option value="${format.weight}">${format.label}</option> `;
    });
  }
}
