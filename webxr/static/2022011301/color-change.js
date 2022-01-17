AFRAME.registerComponent('color-change', {
    schema: {
        color: {default: 'green'}
    },
    init() {
        this.bindMethods();
        this.el.addEventListener('pinchedstarted', this.onPinchedStarted);
        this.el.addEventListener('pinchedended', this.onPinchedEnded);
    },
    bindMethods() {
        this.onPinchedStarted = this.onPinchedStarted.bind(this);
        this.onPinchedEnded = this.onPinchedEnded.bind(this);
    },
    onPinchedStarted() {
        this.originalColor = this.originalColor || this.el.getAttribute('material').color;
        this.el.setAttribute('material', 'color', this.data.color);
    },
    onPinchedEnded() {
        this.el.setAttribute('material', 'color', this.originalColor);
    }
});