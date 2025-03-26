import { Quantum } from './Quantum.js';

export const QuantumWait = class extends Quantum {
    constructor(props) {
        super(props);
        this.attachShadow({ mode: 'open' });
        this.template = this.#getTemplate();
        this.QuantumWait = document.importNode(this.template.content, true);
        this.styleLoaded = false;
    }

    #getTemplate() {
        const template = document.createElement('template');
        template.innerHTML = `
        <div class="icon-container" id="normal-icon-container">
            <img src="" class="QuantumWaitIcon" style="width: 50px; height: 50px;" />
        </div>
        <div id="overlay" class="overlay hidden">
            <div class="icon-container">
                <img src="" class="QuantumWaitIcon" />
            </div>
        </div>
        `;
        return template;
    }

    static get observedAttributes() {
        return ['icon-name', 'rotate', 'size', 'modal'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.styleLoaded) {
            switch (name) {
                case 'icon-name':
                    this.updateIcon();
                    break;
                case 'rotate':
                    this.updateRotation();
                    break;
                case 'size':
                    this.updateSize();
                    break;
                case 'modal':
                    this.updateModal();
                    break;
            }
        }
    }

    async applyStyles(cssFileName) {
        try {
            const cssText = await this.getCssFile(cssFileName);
            if (!cssText) {
                throw new Error(`Failed to load CSS: ${cssFileName}`);
            }
            this.style.visibility = 'hidden';

            const styleElement = document.createElement('style');
            styleElement.textContent = cssText;
            this.shadowRoot.appendChild(styleElement);
            this.styleLoaded = true;
            this.shadowRoot.appendChild(this.QuantumWait);
            this.updateAttributes();
            this.style.visibility = 'visible';

        } catch (error) {
            console.error('Error applying CSS file:', error);
        }
    }

    async connectedCallback() {
        console.log("QuantumWait connected!");
        await this.applyStyles('QuantumWait');
    }

    async updateIcon() {
        const iconName = this.getAttribute('icon-name');
        const svgURL = await this.getSVG(iconName); // Get the SVG URL
        const imgElement = this.shadowRoot.querySelector('#normal-icon-container .QuantumWaitIcon');
        const imgElementOverlay = this.shadowRoot.querySelector('#overlay .icon-container .QuantumWaitIcon');

        if (svgURL) {
            imgElement.src = svgURL; // Set the src to the URL
            imgElementOverlay.src = svgURL
        } else {
            imgElement.src = '';
            imgElementOverlay.src = ''
        }
    }

    updateRotation() {
        const imgElement = this.shadowRoot.querySelector('#normal-icon-container .QuantumWaitIcon');
        const imgElementOverlay = this.shadowRoot.querySelector('#overlay .icon-container .QuantumWaitIcon');
        const rotateValue = this.getAttribute('rotate');
        const rotateSpeed = rotateValue ? rotateValue : '2s';
        if (this.hasAttribute('rotate')) {
            imgElement.style.animation = `rotate ${rotateSpeed} linear infinite`;
            imgElementOverlay.style.animation = `rotate ${rotateSpeed} linear infinite`;
        } else {
            imgElement.style.animation = '';
            imgElementOverlay.style.animation = '';
        }
    }

    updateSize() {
        const size = this.getAttribute('size') || '50px';
        const imgElement = this.shadowRoot.querySelector('#normal-icon-container .QuantumWaitIcon');
        const imgElementOverlay = this.shadowRoot.querySelector('#overlay .icon-container .QuantumWaitIcon');
        imgElement.style.width = size;
        imgElement.style.height = size;
        imgElementOverlay.style.width = size;
        imgElementOverlay.style.height = size;
    }

    updateModal() {
        const overlay = this.shadowRoot.getElementById('overlay');
        const normalIconContainer = this.shadowRoot.getElementById('normal-icon-container');
        if (this.hasAttribute('modal')) {
            overlay.classList.remove('hidden');
            normalIconContainer.classList.add('hidden'); // Hide the normal icon
        } else {
            overlay.classList.add('hidden');
            normalIconContainer.classList.remove('hidden'); // Show the normal icon
        }
    }

    updateAttributes() {
        this.updateIcon();
        this.updateRotation();
        this.updateSize();
        this.updateModal();
    }
}

window.customElements.define('quantum-wait', QuantumWait);