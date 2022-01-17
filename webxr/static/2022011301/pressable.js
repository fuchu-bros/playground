AFRAME.registerComponent('pressable', {
    schema: {
        pressDistance: {default: 0.06}
    },
    init() {
        this.worldPosition = new THREE.Vector3();
        this.handEls = document.querySelectorAll('[hand-tracking-controls]');
        this.pressed = false;
    },
    tick() {
        const handEls = this.handEls;
        let handEl, distance;
        for (var i = 0; i < handEls.length; i++) {
            handEl = handEls[i];
            distance = this.calculateFingerDistance(handEl.components['hand-tracking-controls'].indexTipPosition);
            if (distance < this.data.pressDistance) {
                if (!this.pressed) this.el.emit('pressedstarted');
                this.pressed = true;
                return;
            }
        }
        if (this.pressed) this.el.emit('pressedended');
        this.pressed = false;
    },
    calculateFingerDistance(fingerPosition) {
        const {el, worldPosition} = this;

        worldPosition.copy(el.object3D.position);
        el.object3D.parent.updateMatrixWorld();
        el.object3D.parent.localToWorld(worldPosition);

        return worldPosition.distanceTo(fingerPosition);
    }
})