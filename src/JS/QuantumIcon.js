import { Quantum } from './Quantum.js';

export const QuantumIcon = class extends Quantum {
    constructor(props) {
        super(props);
        this.attachShadow({ mode: 'open' });
        this.template = this.#getTemplate();
        this.QuantumIcon = document.importNode(this.template.content, true)
        this.styleLoaded = false;
    }

    #getTemplate() {
        const template = document.createElement('template');
        template.innerHTML = `
        <div class="QuantumIconContainer">
            <div class="QuantumContainerSVG">
                <svg class="QuantumIcon"></svg>
            </div>
            <div class="QuantumIconCaption"></div>
            <div class="QuantumIconHint"></div>
        </div>                
        `;
        return template;
    }

    static get observedAttributes() {
        return ['icon-name', 'caption', 'hint', 'active-shadow', 'on-press'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.styleLoaded) {
            switch (name) {
                case 'icon-name':
                    this.updateIcon();
                    break;
                case 'caption':
                    this.updateCaption();
                    break;
                case 'hint':
                    this.updateHint();
                    break;
                case 'active-shadow':
                    this.updateActiveShadow();
                    break;
                case 'on-press':
                    this.updateOnPress();
                    break;
            }
        }
    }

    async applyStyles(cssFileName) {
        try {
            const cssText = await this.getCssFile(cssFileName);
            if (cssText) {
                const styleElement = document.createElement('style');
                styleElement.textContent = cssText;
                this.shadowRoot.appendChild(styleElement);
                this.styleLoaded = true;
                this.shadowRoot.appendChild(this.QuantumIcon)
                this.updateAttributes();
            }
            else {
                throw new Error(`Failed to load CSS: ${cssFileName}`);
            }
        } catch (error) {
            console.error("Error applying CSS file:", error);
        }
    }

    async getSVGIcon(iconName) {
        if (!iconName) return '';
        try {
            const svgURL = await this.getSVG(iconName);
            if (!svgURL) return '';

            const response = await fetch(svgURL);
            if (!response.ok) {
                throw new Error(`Failed to fetch SVG: ${svgURL}`);
            }
            const svgText = await response.text();

            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = svgText;
            const svgElement = tempDiv.querySelector("svg");

            if (svgElement) {
                if (!svgElement.hasAttribute("viewBox")) {
                    let width = svgElement.getAttribute("width") || "24";
                    let height = svgElement.getAttribute("height") || "24";
                    svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
                }
                svgElement.setAttribute("width", "100%");
                svgElement.setAttribute("height", "100%");
            }
            return tempDiv.innerHTML;
        } catch (error) {
            console.error('Error loading SVG:', error);
            return '';
        }
    }

    async connectedCallback() {
        console.log("QuantumIcon connected!");
        this.style.visibility = 'hidden'; // Hide while loading

        await this.applyStyles('QuantumIcon'); // Load css

        this.updateAttributes();
        this.style.visibility = 'visible'; //Show after loading

        const container = this.shadowRoot.querySelector('.QuantumIconContainer');
        const hintElement = this.shadowRoot.querySelector('.QuantumIconHint');

        container.addEventListener('mouseenter', () => {
            if (this.getAttribute('hint')) hintElement.style.visibility = 'visible';
        });
        container.addEventListener('mouseleave', () => {
            hintElement.style.visibility = 'hidden';
        });

        container.addEventListener('click', () => {
            this.executeOnPress();
        });
    }

    updateAttributes() {
        this.updateIcon();
        this.updateCaption();
        this.updateHint();
        this.updateActiveShadow();
        this.updateOnPress();
    }

    async updateIcon() {
        const iconName = this.getAttribute('icon-name');
        const svgElement = this.shadowRoot.querySelector('.QuantumIcon');
        svgElement.innerHTML = await this.getSVGIcon(iconName);
    }

    updateCaption() {
        const caption = this.getAttribute('caption') || '';
        this.shadowRoot.querySelector('.QuantumIconCaption').textContent = caption;
    }

    updateHint() {
        const hint = this.getAttribute('hint') || '';
        const hintElement = this.shadowRoot.querySelector('.QuantumIconHint');
        hintElement.textContent = hint;
    }

    updateActiveShadow() {
        const container = this.shadowRoot.querySelector('.QuantumIconContainer');
        if (this.hasAttribute('active-shadow')) {
            container.classList.add('active-shadow');
        } else {
            container.classList.remove('active-shadow');
        }
    }

    updateOnPress() {
        // This method can be used to update any state if needed
    }

    executeOnPress() {
        const onPress = this.getAttribute('on-press');
        if (onPress) {
            const func = window[onPress];
            if (typeof func === 'function') {
                func.call(this);
            } else {
                console.warn(`Function ${onPress} is not defined`);
            }
        }
    }
}

window.customElements.define('quantum-icon', QuantumIcon);