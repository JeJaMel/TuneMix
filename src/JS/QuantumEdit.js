export const QuantumEdit = class extends Quantum {
    static observedAttributes = ["caption"];

    constructor(props) {
        super();
        this.name = "QuantumEdit";
        this.props = props;
        this.built = () => {};
        this.attachShadow({ mode: "open" });
        this._reactive = false;
        this._message = "";
    }

    

    async #getCss() {
        return quantum.getCssFile("QuantumEdit");
    }

    #getTemplate() {
        return `
            <div class="QuantumEditContainer">
                <input class="QuantumEdit">
                <label class="QuantumEditLabel"></label>
            </div>
        `;
    }

    async #checkAttributes() {
        try {
            for (const attr of this.getAttributeNames()) {
                if (!attr.startsWith("on")) {
                    this[attr] = this.getAttribute(attr);
                } else {
                    const eventMap = {
                        onescape: "escape",
                        onenter: "enter"
                    };
                    if (eventMap[attr]) {
                        this.addEventListener(eventMap[attr], () => eval(this.getAttribute(attr)));
                    }
                }
            }

            if (this.getAttribute("id")) {
                await quantum.createInstance("QuantumEdit", { id: this.getAttribute("id") });
                this.id = this.getAttribute("id");
            }
        } catch (error) {
            console.error("Error en #checkAttributes:", error);
        }
    }

    async #checkProps() {
        try {
            if (this.props) {
                for (const [attr, value] of Object.entries(this.props)) {
                    if (attr === "style") {
                        Object.assign(this.mainElement.style, value);
                    } else if (attr === "events") {
                        for (const [event, handler] of Object.entries(value)) {
                            this.mainElement.addEventListener(event, handler);
                        }
                    } else {
                        this.setAttribute(attr, value);
                        this[attr] = value;
                        if (attr === "id") {
                            await quantum.createInstance("QuantumEdit", { id: this[attr] });
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error en #checkProps:", error);
        }
    }

    async #render() {
        try {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(await this.#getCss());
            this.shadowRoot.adoptedStyleSheets = [sheet];

            const template = document.createElement("template");
            template.innerHTML = this.#getTemplate();
            const tpc = template.content.cloneNode(true);

            this.mainElement = tpc.firstElementChild;
            this.inputElement = this.mainElement.querySelector("input");
            this.labelElement = this.mainElement.querySelector("label");

            this.shadowRoot.appendChild(this.mainElement);
        } catch (error) {
            console.error("Error en #render:", error);
        }
    }

    async connectedCallback(){
        await this.#render();
        await this.#checkAttributes();
        await this.#checkProps();
        let label = this.shadowRoot.querySelector(".QuantumEditLabel");
        if(label && !label.textContent){
            label.textContent = this.getAttribute("caption") || "Escribe aqui";
        }
        this.builtEvents();
        this.built();
    }


    builtEvents() {
        this.labelElement.addEventListener("click", () => this.inputElement.focus());
        this.inputElement.addEventListener("focus", () => this.#animationUp());
        this.inputElement.addEventListener("change", () => {
            this.#animationUp();
      
         });
        this.inputElement.addEventListener("keyup", this.#handleKeyEvents.bind(this));
        this.inputElement.addEventListener("blur", () => {
            if (!this.inputElement.value.trim() && this.inputElement.type !== "date") {
                this.#animationDown();
            }
        });
    }

    #handleKeyEvents(ev) {
        if (ev.key === "Enter") this.dispatchEvent(new CustomEvent("enter", { bubbles: true }));
        if (ev.key === "Escape") this.dispatchEvent(new CustomEvent("escape", { bubbles: true }));
        this.#animationUp();
        if (this._reactive) quantum.react();
    }

    focus() {
        this.inputElement.focus();
    }

    addToBody() {
        document.body.appendChild(this);
    }

    getEdit() {
        return this.inputElement;
    }

    clean() {
        this.inputElement.value = "";
    }

    #animationUp() {
        this.labelElement.style.animation = "animationLabelUp .5s both";
    }

    #animationDown() {
        this.labelElement.style.animation = "animationLabelDown .5s both";
    }

    getIntValue() {
        return parseInt(this.value, 10);
    }

    getFloatValue(dec) {
        let v = parseFloat(this.value);
        return dec ? parseFloat(v.toFixed(dec)) : v;
    }

    setAttributeAndUpdate(attr, val) {
        this.setAttribute(attr, val);
        this.inputElement[attr] = val;
    }

    get caption() {
        return this.labelElement.innerText;
    }
    set caption(val) {
   
        this.setAttribute("caption", val);
        let label = this.shadowRoot?.querySelector('.QuantumEditLabel');
        if(label) label.textContent = val;
        this.dispatchEvent(new CustomEvent("changeCaption", { detail: { caption: val }}));
    }

    get value() {
        return this.inputElement.value;
    }
    set value(val) {
        this.setAttributeAndUpdate("value", val);
        this.#animationUp();
    }


    get disabled() {
        return this.inputElement.disabled;
    }
    set disabled(val) {
        this.setAttributeAndUpdate("disabled", val);
    }

    get reactive() {
        return this._reactive;
    }
    set reactive(val) {
        this.setAttributeAndUpdate("reactive", val);
        this._reactive = val;
    }

    get type() {
        return this.inputElement.type;
    }
    set type(val) {
        this.setAttributeAndUpdate("type", val);
    }

    get required() {
        return this.inputElement.required;
    }
    set required(val) {
        this.setAttributeAndUpdate("required", val);
    }

    get message() {
        return this._message;
    }
    set message(val) {
        this.setAttributeAndUpdate("message", val);
    }

    get max() {
        return this.inputElement.max;
    }
    set max(val) {
        this.setAttributeAndUpdate("max", val);
    }

    get min() {
        return this.inputElement.min;
    }
    set min(val) {
        this.setAttributeAndUpdate("min", val);
    }

    get maxlength() {
        return this.inputElement.maxLength;
    }
    set maxlength(val) {
        this.setAttributeAndUpdate("maxlength", val);
    }

    get minlength() {
        return this.inputElement.minLength;
    }
    set minlength(val) {
        this.setAttributeAndUpdate("minlength", val);
    }

    get pattern() {
        return this.inputElement.pattern;
    }
    set pattern(val) {
        this.setAttributeAndUpdate("pattern", val);
    }

    get readonly() {
        return this.inputElement.readOnly;
    }
    set readonly(val) {
        this.style.opacity = val ? 0.4 : 1;
        this.setAttributeAndUpdate("readonly", val);
    }
};

customElements.define("quantum-edit", QuantumEdit);
