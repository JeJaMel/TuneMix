export class QuantumCheckBox extends Quantum
{
    constructor(props)
    {
        super();  
        this.name = "QuantumCheckBox";
        this.props = props;
        if (props?.id) this.id = props.id;
        this.built = ()=>{}; 
        this.attachShadow({mode:'open'});
    }

    #getTemplate()
    {
        return `
        <label class="QuantumCheckBox">
            <input class="checkbox" type="checkbox">
            <span class="checkmark"></span>
            <label class="caption"></label>
        </label>`        
    }

    async #getCss() {return await quantum.getCssFile(this.name);}

    #render(css)
    {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.shadowRoot.innerHTML = this.#getTemplate();
        this.mainElement = this.shadowRoot.querySelector('.QuantumCheckBox');
        this.checkElement = this.mainElement.querySelector('.checkbox');
        this.spanElement = this.mainElement.querySelector('.checkmark');
        this.labelElement = this.mainElement.querySelector('.caption');
    }

    #applyProps()
    {
        if (this.props)
        {
            Object.entries(this.props).forEach(([key, value]) =>
            {
                if (key === 'style') Object.assign(this.mainElement.style, value);
                else if (key === 'events')
                    Object.entries(value).forEach(([event, handler]) => this.spanElement.addEventListener(event, handler));
                else { this[key] = value; this.setAttribute(key, value); }
            });
        }
        else
            this.getAttributeNames().forEach(attr =>
            {
                if (!attr.startsWith("on"))
                {
                    const value = this.getAttribute(attr);
                    this.setAttribute(attr, value);
                    this[attr] = value;
                }
                else
                {
                    this.checkElement[attr] = this[attr];
                    this[attr] = null;
                }
            });
    }
    
    async connectedCallback()
    {
        this.#render(await this.#getCss())
        this.#applyProps();
        this.#builtEvents();
        this.built();
    }

    addToBody(){quantum.addToBody(this)}

    #builtEvents()
    {
        this.checkElement.addEventListener('keyup', (ev) =>
        {
            if (ev.key === 'Enter' && !this.disabled)
            {
                this.checked = !this.checked;
                this.checking();
                this.dispatchEvent(new CustomEvent("enter", {bubbles: true}));
            }
        }, false);
        this.checkElement.addEventListener('change', () => {if (!this.disabled) this.checking();}, false);
    }

    checking()
    {
        if (this.master)
        {
            quantum.checkGroup[this._group].forEach(item =>
            {
                if (!item.master)
                {
                    item.checked = this.checked;
                    item.sts = item.checked ? 1 : 0;
                }
                else item.spanElement.className = 'checkMark';
            });
        }
        else
        {
            let allChecked = true;
            let allUnchecked = true;
            let masterItem = null;

            quantum.checkGroup[this._group].forEach(item =>
            {
                if (!item.master)
                {
                    allChecked = allChecked && item.checked;
                    allUnchecked = allUnchecked && !item.checked;
                }
                else masterItem = item;
            });

            if (masterItem)
            {
                if (allChecked)
                {
                    masterItem.sts = 1;
                    masterItem.checked = true;
                    masterItem.spanElement.className = 'checkMark';
                }
                else if (allUnchecked)
                {
                    masterItem.sts = 0;
                    masterItem.checked = false;
                    masterItem.spanElement.className = 'checkMark';
                }
                else
                {
                    masterItem.sts = -1;
                    masterItem.checked = true;
                    masterItem.spanElement.className = 'checkMarkInd';
                }
            }
        }
    }
    
    #checking(val)
    {
        this.checkElement.checked = val;
        if (this.master && this._sts !== -1 && this._group)
        {
            quantum.checkGroup[this._group].forEach(item =>
            {
                if (!item.master)
                {
                    item.checkElement.checked = val;
                    item._sts = val ? 1 : 0;
                }
            });
        }
    }
    #checkDisable(val) { this.style.opacity = val ? 0.3 : 1; this.style.display = 'none'; }

    get caption() {return this.mainElement.innerText;}
    set caption(val)
    {
        this.setAttribute('caption', val);
        this.labelElement.innerText = val;
        this.dispatchEvent(new CustomEvent("changeCaption", {bubbles: true}));
    }
    get checked() {return this.checkElement.checked}
    set checked(val)
    {
        this.checkElement.checked = val;
        this.#checking(val);
    }
    get disabled() {return this.checkElement.disabled;}
    set disabled(val)
    {
        this.setAttribute('disabled', val);
        this.checkElement.disabled = val;
        this.#checkDisable(val);
    }
    get group() {return this._group;}
    set group(val)
    {
        this._group = val;
        quantum.checkGroup[val] = quantum.checkGroup[val] || [];
        quantum.checkGroup[val].push(this);
    }
    get master() {return this._master;}
    set master(val) {this._master = val;}
    get sts() {return this._sts;}
    set sts(val) {this._sts = val;}
}

customElements.define ('quantum-check', QuantumCheckBox);

