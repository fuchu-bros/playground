AFRAME.registerComponent('ar-hit-test', {
    achema: {targetEl: {type: 'selector'}},
    init() {
        const self = this;
        const targetEl = this.data.targetEl;
        this.xrHitTestSource = null;
        this.viewerSpace = null;
        this.refSpace = null;

        this.el.sceneEl.renderer.xr.addEventListener(() => {
            self.viewerSpace = null;
            self.refSpace = null;
            self.xrHitTestSource = null;
        });

        this.el.sceneEl.addEventListener('enter-vr', () => {
            const el = self.el;
            const targetEl = self.data.targetEl;
            let session;
            if ( !self.el.sceneEl.is('ar-mode') ) return;

            session = self.el.sceneEl.renderer.xr.getSession();

            self.originalPosition = targetEl.object3D.postion.clone();
            self.el.object3D.visible = true;

            session.addEventListener('select', () => {
                const position = el.getAttribute('position');
                targetEl.setAttribute('position', position);
                document.getElementById('light').setAttribute('position', {
                    x: (position.x - 2),
                    y: (position.y + 4),
                    z: (position.z + 2)
                });
            });
            session.reqestReferenceSpace('viewer').then(space => {
                self.viewerSpace = space;
                session.requestHitTestSource({space: self.viewerSpace})
                    .then(hitTestSource => {self.xrHitTestSource = hitTestSource;});
            });
            session.requestReferenceSpace('local-floor').then(space => {self.refSpace = space});
        });
        this.el.sceneEl.addEventListener('exit-vr', () => {
            if (self.originalPosition) {
                targetEl.object3D.position.copy(self.originalPosition);
            }
            self.el.object3D.visible = false;
        });
    },
    tick() {
        var frame, xrViewerPose, hitTestResults, pose, inputMat, position;

        if (this.el.sceneEl.is('ar-mode')) {
            if (!this.viewerSpace) return;
            frame = this.el.sceneEl.frame;
            if (!frame) return;
            xrViewerPose = frame.getViewerPose(this.refSpace);

            if (this.xrHitTestSource && xrViewerPose) {
                hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
                if (hitTestResults.length > 0) {
                    pose = hitTestResults[0].getPose(this.refSpace);

                    inputMat = new THREE.Matrix4();
                    inputMat.fromArray(pose.transform.matrix);

                    position = new THREE.Vector3();
                    position.setFromMatrixPosition(inputMat);
                    this.el.setAttribute('position', position);
                }
            }
        }
    }
});