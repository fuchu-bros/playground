AFRAME.registerComponent('slider', {
    schema: {
        width: {default: 0.5}
    },
    init() {
        const trackEl = this.trackEl = document.createElement('a-entity');
        this.localPosition = new THREE.Vector3();
        this.onPinchedMoved = this.onPinchedMoved.bind(this);

        trackEl.setAttribute('geometry', {
            primitive: 'box',
            height: 0.01,
            width: this.data.width,
            depth: 0.01
        });

        trackEl.setAttribute('material', {
            color: 'white'
        });

        this.el.appendChild(trackEl);

        const pickerEl = this.pickerEl = document.createElement('a-entity');

        pickerEl.setAttribute('geometry', {
            primitive: 'cylinder',
            radius: 0.01,
            height: 0.05
        });

        pickerEl.setAttribute('material', {
            color: '#3a505c'
        });
        pickerEl.setAttribute('pinchable', {
            pinchDistance: 0.05
        });
        pickerEl.setAttribute('rotation', {
            x: 90, y: 0, z: 0
        });
        pickerEl.setAttribute('color-change', '');

        this.el.appendChild(pickerEl);

        pickerEl.addEventListener('pinchedmoved', this.onPinchedMoved);
    },
    onPinchedMoved(e) {
        const el = this.el;
        const evtDetail = this.evtDetail;
        const halfWidth = this.data.width / 2;
        const localPosition = this.localPosition;
        localPosition.copy(evt.detail.position);
        el.object3D.updateMatrixWorld();
        el.object3D.worldToLocal(localPosition);
        if (localPosition.x < -halfWidth || localPosition.x > halfWidth) return;
        this.pickerEl.object3D.position.x = localPosition.x;
        evtDetail.value = (this.pickerEl.object3D.position.x + halfWidth) / this.data.width;

        this.el.emit('sliderchanged', evtDetail);
    }
})