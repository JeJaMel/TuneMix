export class Quantum extends HTMLElement
{
    constructor(props)
    {
        super();
        this.modules = new Map();
        this.instances = new Map();
        this.cssFiles = new Map();
        this.props = props;
    }

    async getCssFile(fileName)
    {
        if (!this.cssFiles.has(fileName))
        {
            const css = await fetch(`${quantum.routes.css}${fileName}.css`).then(response => response.text());
            this.cssFiles.set(fileName, css);
            return css;
        }
        else return this.cssFiles.get(fileName);
    }

    async getSVG(fileName)
    {
        const response = await fetch(`${quantum.routes.svg}${fileName}.svg`);
        if (response.ok) return `${quantum.routes.svg}${fileName}.svg`;
        else { console.error(`SVG file not found.`); return null;}
    }

    async getClass(className)
    {
        if (!this.modules.has(className))
        {
            const module = await import('./' + className + '.js');
            this.modules.set(className, module[className]);
        }
        return this.modules.get(className);
    }

    async createInstance(className, props)
    {
        if (!this.instances.has(props.id))
        {
            const newClass = await this.getClass(className);
            const instance = new newClass(props);
            this.instances.set(props.id, instance);
            return instance;
        }
        return this.instances.get(props.id);
    }

    getInstance(id)
    {
        const e = document.getElementById(id);
        if(e) return e; 
        else
        {
            if(this.instances.has(id)) return this.instances.get(id)
            else return null
        }
    }

    hide() {this.hidden = true;}
    show() {this.hidden = false;}
    addToBody(obj) {document.body.appendChild(obj);}
}

customElements.define('x-quantum', Quantum);

window.Quantum = Quantum;
window.quantum = new Quantum();
quantum.radioGroup = quantum.checkGroup = [];
quantum.routes = {css: '../CSS/', svg: '../Images/'};

document.addEventListener("DOMContentLoaded", () => {if (quantumInit) quantumInit();});