AFRAME.registerComponent('button', {
    schema: {
        label: {default: 'label'},
        width: {detault: 0.11},
        toggable: {default: false}
    },
    init() {
        const el = this.el;
        const labelEl = this.labelEl = document.createElement('a-entity');

        this.color = '#3a50c5';
        el.setAttribute('geometry', {
            primitive: 'box',
            width: this.data.width,
            height: 0.05,
            depth: 0.04
        });

        el.setAttribute('material', {color: this.color});
        el.setAttribute('pressable', '');

        labelEl.setAttribute('position', '0 0 0.02');
        labelEl.setAttribute('text', {
            value: this.data.label,
            color: 'white',
            align: 'center'
        });

        labelEl.setAttribute('scale', '0.75 0.75 0.75');
        this.el.appendChild(labelEl);

        this.bindMethods();
        this.el.addEventListener('stateadded', this.stateChanged);
        this.el.addEventListener('stateremoved', this.stateChanged);
        this.el.addEventListener('pressedstarted', this.onPressedStarted);
        this.el.addEventListener('pressedended', this.onPressedEnded);
    },
    bindMethods() {
        this.stateChanged = this.stateChanged.bind(this);
        this.onPressedStarted = this.onPressedStarted.bind(this);
        this.onPressedEnded = this.onPressedEnded.bind(this);
    },
    update(oldData) {
        if (oldData.label !== this.data.label) {
            if (oldData.label !== this.data.label) {
                this.labelEl.setAttribute('text', 'value', this.data.label);
            }
        }
    },
    stateChanged: function(){
        const color = this.el.is('pressed') ? 'green' : this.color;
        this.el.setAttribute('material', {color: color});
    },
    onPressedStarted() {
        const el = this.el;
        el.setAttribute('material', {color: 'green'});
        el.emit('click');
        if (this.data.toggable) {
            if (el.is('pressed')) {
                el.removeState('pressed');
            } else {
                el.addState('pressed');
            }
        }
    },
    onPressedEnded() {
        if (this.el.is('pressed')) return;
        this.el.setAttribute('material', {color: this.color});
    }
})