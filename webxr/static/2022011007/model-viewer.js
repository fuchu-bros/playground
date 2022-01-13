AFRAME.registerComponent('model-viewer', {
    schema: {
        gltModel: {default: ''},
        title: {default: ''},
        uploadUIEnabled: {default: true}
    },
    init() {
        const el = this.el;

        el.setAttribute('renderer', {colorManagement: true});
        el.setAttribute('cursor', {rayOrigin: 'mouse', fuse: false});
        el.setAttribute('webxr', {optionFeatures: 'hit-test, local-floor'});
        el.setAttribute('raycaster', {objects: '.raycastable'});

        this.onModelLoaded = this.onModelLoaded.bind(this);

        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);

        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.submitURLButtonClicked = this.submitURLButtonClicked.bind(this);
        this.onThumbstickMoved = this.onThumbstickMoved.bind(this);

        this.onEnterVR = this.onEnterVR.bind(this);
        this.onExitVR = this.onExitVR.bind(this);

        this.onMouseDownLaserHitPanel = this.onMouseDownLaserHitPanel.bind(this);
        this.onMouseUpLaserHitPanel = this.onMouseUpLaserHitPanel.bind(this);

        this.onOrientationChange = this.onOrientationChange.bind(this);

        this.initCameraRig();
        this.initEntities();
        this.initBackground();

        if (this.data.uploadUIEnabled) this.initUploadInput();

        this.el.sceneEl.canvas.oncontextmnu = evt => evt.preventDefault();

        window.addEventListener('orientationchange', this.onOrientationChange);

        this.laserHitPanelEl.addEventListener('mousedown', this.onMouseDownLaserHitPanel);
        this.laserHitPanelEl.addEventListener('mouseup', this.onMouseUpLaserHitPanel);

        this.leftHandEl.addEventListener('thumbstickmoved', this.onThumbstickMoved);
        this.rightHandEl.addEventListener('thumbstickmoved', this.onThumbstickMoved);

        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('wheel', this.onMouseWheel);

        document.addEventListener('touchend', this.onTouchEnd);
        document.addEventListener('touchmove', this.onTouchMove);

        this.el.sceneEl.addEventListener('enter-vr', this.onEnterVR);
        this.el.sceneEl.addEventListener('exit-vr', this.onExitVR);

        this.modelEl.addEventListener('model-loaded', this.onModelLoaded);
    },
    initUploadInput() {
        const uploadContainerEl = this.uploadContainerEl = document.createElement('div');
        const inputEl = this.inputEl = document.createElement('input');
        const submitButtonEl = this.submitButtonEl = document.createElement('button');
        const style = document.createElement('style');
        let css = `
            .a-upload-model {
                box-sizing: border-box; display: inline-block; height: 34px; padding: 0; width: 70%;
                bottom: 20px; left: 15%; right: 15%; position: absolute; color: white;
                font-size: 12px; line-height: 12px; border: none;
                border-radius: 5px
            }
            .a-upload-model.hidden {display: none}
            .a-upload-model-button {cursor: pointer; padding: 0px 2px 0 2px; font-weight: bold; color: #666; border: 3px solid #666; box-sizing: border-box; vertical-align: middle; width: 25%; max-width: 110px; border-radius: 10px; height: 34px; background-color: white; margin: 0;}
            .a-upload-model-button:hover {border-color: #ef2d5e; color: #ef2d5e}
            .a-upload-model-input {color: #666; vertical-align: middle; padding: 0px 10px 0 10px; text-transform: uppercase; border: 0; width: 75%; height: 100%; border-radius: 10px; margin-right: 10px}
            @media only screen and (max-width: 800px) {
                .a-upload-model {margin: auto;}
                .a-upload-model-input {width: 70%;}
            }
            @media only screen and (max-width: 700px) {
                .a-upload-model {display: none}
            }
        `;

        const inputDefaultValue = this.inputDefaultValue = 'Copy URL to glTF or glb model';
        if (AFRAME.utils.device.checkARSupport()) {
            css += `
                @media only screen and (max-width: 800px) {
                    .a-upload-model-input {width: 60%;}
                }
            `;
        }

        uploadContainerEl.classList.add('a-upload-model');
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        document.getElementsByTagName('head')[0].appendChild(style);

        submitButtonEl.classList.add('a-upload-model-button');
        submitButtonEl.innerHTML = 'OPEN MODEL';
        submitButtonEl.addEventListener('click', this.submitURLButtonClicked);

        inputEl.classList.add('a-upload-model-input');
        inputEl.onfocus = () => {
            if (this.value !== inputDefaultValue) return;
            this.value = '';
        }
        inputEl.onblur = () => {
            if (this.value) return;
            this.value = inputDefaultValue;
        }

        this.el.sceneEl.addEventListener('infomessageopened', () => {
            uploadContainerEl.classList.add('hidden');
        });
        this.el.sceneEl.addEventListener('infomessageclosed', () => {
            uploadContainerEl.classList.remove('hidden');
        });

        inputEl.value = inputDefaultValue;

        uploadContainerEl.appendChild(inputEl);
        uploadContainerEl.appendChild(submitButtonEl);
    },
    update() {
        if (!this.data.gltfModel) return;
        this.modelEl.setAttribute('gltf-model', this.data.gltfModel);
    },
    submitURLButtonClicked(e) {
        const modelURL =this.inputEl.value;
        if (modelURL === this.inputDefaultValue) return;
        this.el.setAttribute('model-viewer', 'gltfModel', modelURL);
    },
    initCameraRig() {
        const cameraRigEl = this.cameraRigEl = document.createElement('a-entity');
        const cameraEl = this.cameraEl = document.createElement('a-entity');
        const rightHandEl = this.rightHandEl = document.createElement('a-entity');
        const leftHandEl = this.leftHandEl = document.createElement('a-entity');

        cameraEl.setAttribute('camera', {fov: 60});
        cameraEl.setAttribute('look-controls', {
            magicWindowTrackingEnabled:false,
            mouseEabled: false,
            touchEnabled: false
        });

        rightHandEl.setAttribute('rotation', '0 90 0');
        rightHandEl.setAttribute('laser-controls', {hand: 'right'});
        rightHandEl.setAttribute('raycaster', {objects: '.raycastable'});
        rightHandEl.setAttribute('line', {color: '#118A7E'});

        leftHandEl.setAttribute('rotation', '0 90 0');
        leftHandEl.setAttribute('laser-controls', {hand: 'right'});
        leftHandEl.setAttribute('raycaster', {objects: '.raycastable'});
        leftHandEl.setAttribute('line', {color: '#118A7E'});

        cameraRigEl.appendChild(cameraEl);
        cameraRigEl.appendChild(rightHandEl);
        cameraRigEl.appendChild(leftHandEl);

        this.el.appendChild(cameraRigEl);
    },
    initBackground() {
        const backgroundEl = this.backgroundEl = document.querySelector('a-entity');
        backgroundEl.setAttribute('geometry', {primitive: 'sphere', radius: 65});
        backgroundEl.setAttribute('material', {
            shader: 'background-gradient',
            colorTop: '#37383c',
            colorbottom: '#757575',
            side: 'back'
        });
        backgroundEl.setAttribute('hide-on-enter-ar', '');
    },
    initEntities() {
        const containerEl = this.containerEl = document.createElement('a-entity');
        const laserHitPanelEl = this.laserHitPanelEl = document.createElement('a-entity');
        const modelPivotEl = this.modelPivotEl = document.createElement('a-entiy');
        const modelEl = this.modelEl = document.createElement('a-entity');
        const shadowEl = this.shadowEl = document.createElement('a-entity');
        const arShadowEl = this.arShadowEl = document.createElement('a-entity');
        const titleEl = this.titleEl = document.createElement('a-entity');
        const reticleEl = this.reticleEl = document.createElement('a-entity');
        const lightEl = this.lightEl = document.createElement('a-entity');
        const sceneLightEl = this.sceneLightEl = document.createElement('a-entity');

        sceneLightEl.setAttribute('light', {
            type: 'hemisphere',
            intensity: 1
        });

        modelPivotEl.id = 'modelPivot';

        this.el.appendChild(sceneLightEl);

        reticleEl.setAttribute('gltf-model', '#reticle');
        reticleEl.setAttribute('scale', '0.8 0.8 0.8');
        reticleEl.setAttribute('ar-hit-test', {targetEl: '#modelPivot'});
        reticleEl.setAttribute('visible', 'false');

        modelEl.id = 'model';

        laserHitPanelEl.id = 'laserHitPanel';
        laserHitPanelEl.setAttribute('position', '0 0 -10');
        laserHitPanelEl.setAttribute('geometry', 'primitive: plane; width: 30; height: 20');
        laserHitPanelEl.setAttribute('material', 'color: red');
        laserHitPanelEl.setAttribute('visible', 'false');
        laserHitPanelEl.classList.add('raycastable');

        this.containerEl.appendChild(laserHitPanelEl);

        modelEl.setAttribute('rotation', '0 -30 0');
        modelEl.setAttribute('animation-mixer', '');
        modelEl.setAttribute('shadow', 'cast: true; receive: false');

        modelPivotEl.appendChild(modelEl);

        shadowEl.setAttribute('rotation', '-90 -30 0');
        shadowEl.setAttribute('geometry', 'primitive: plane; width: 1.0; height: 1.0');
        shadowEl.setAttribute('material', 'src: #shadow; transparent: true; opacty: 0.40');
        shadowEl.setAttribute('hide-on-enter-ar', '');

        modelPivotEl.appendChild(shadowEl);

        arShadowEl.setAttribute('rotation', '-90 0 0');
        arShadowEl.setAttribute('geometry', 'primitive: plane; width: 30.0; heigh: 30.0');
        arShadowEl.setAttribute('shadow', 'recieve: true');
        arShadowEl.setAttribute('ar-shadows', 'opacity: 0.2');
        arShadowEl.setAttribute('visible', 'false');

        modelPivotEl.appendChild(arShadowEl);

        titleEl.id = 'title';
        titleEl.setAttribute('text', `value: ${this.data.title}; width: 6`);
        titleEl.setAttribute('hide-on-enter-ar', '');
        titleEl.setAttribute('visible', 'false');

        this.containerEl.appendChild(titleEl);

        lightEl.id = 'light';
        lightEl.setAttribute('position', '-2 4 2');
        lightEl.setAttribute('light',{
            type: 'directional',
            castShadow: true,
            shadowMapHeight: 1024,
            shadowMapWidth: 1024,
            shadowCameraLeft: -7,
            shadowCameraRight: 5,
            shadowCameraBottom: -5,
            shadowCameraTop: 5,
            intensity: 0.5,
            target: 'modelPivot'
        });

        this.containerEl.appendChild(lightEl);
        this.containerEl.appendChild(modelPivotEl);

        this.el.appendChild(containerEl);
        this.el.appendChild(reticleEl);
    },
    onThumbstickMoved(e) {
        const modelPivotEl = this.modelPivotEl;
        let modelScale = this.modelScale || modelPivotEl.object3D.scale.x;

        modelScale -= e.detail.y / 20;
        modelScale = Math.min(Math.max(0.8, modelScale), 2.0);
        modelPivotEl.object3D.scale.set(modelScale, modelScale, modelScale);
        this.modelScale = modelScale;
    },
    onMouseWheel(e) {
        const modelPivotEl = this.modelPivotEl;
        let modelScale = this.modelScale || modelPivotEl.object3D.scale.x;
        modelScale -= e.deltaY / 100;
        modelPivotEl.object3D.scale.set(modelScale, modelScale, modelScale);
        this.modelScale = modelScale
    },
    onMouseDownLaserHitPanel(e) {
        const cursorEl = e.detail.cursorEl;
        const intersection = cursorEl.components.raycaster.getIntersection(this.laserHitPanelEl);
        if (!intersection) return;
        cursorEl.setAttribute('raycaster', 'lineColor', 'white');
        this.activeHandEl = cursorEl;
        this.oldHandX = undefined;
        this.oldHandY = undefined;
    },
    onMouseUpLaserHitPanel(e){
        const {cursorEl} = e.detail;
        if (cursorEl === this.leftHandEl) this.leftHandPressed = false;
        if (cursorEl === this.rightHandEl) this.rightHandPressed = false;
        cursorEl.setAttribute('raycaster', 'lineColor', 'white');
        if (this.activeHandEl === cursorEl) this.activeHandEl = undefined;
    },
    onOrientationChange() {
        if (AFRAME.utils.device.isLandscape()) {
            this.cameraRigEl.object3D.position.z -= 1;
        } else {
            this.cameraRigEl.object3D.position.z += 1;
        }
    },
    tick() {
        const modelPivotEl = this.modelPivotEl;
        let intersection, intersectionPosition;
        const laserHitPanelEl = this.laserHitPanelEl;
        const activeHandEl = this.activeHandEl;
        if (!this.el.sceneEl.is('vr-mode')) return;
        if (!activeHandEl) return;
        intersection = activeHandEl.components.raycaster.getIntersection(laserHitPanelEl);
        if (!intersection) {
            activeHandEl.setAttribute('raycaster', 'lineColor', 'white');
            return;
        }
        activeHandEl.setAttribute('raycaster', 'lineColor', '#007AFF');
        intersectionPosition = intersection.point;
        this.oldHandX = this.oldHandX || intersectionPosition.x;
        this.oldHandY = this.oldHandY || intersectionPosition.y;

        modelPivotEl.object3D.rotation.y -= (this.oldHandX - intersectionPosition.x) / 4;
        modelPivotEl.object3D.rotation.x += (this.oldHandY - intersectionPosition.y) / 4;

        this.oldHandX = intersectionPosition.x;
        this.oldHandY = intersectionPosition.y;
    },
    onEnterVR() {
        const cameraRigEl = this.cameraRigEl;

        this.cameraRigPosition = cameraRigEl.object3D.position.clone();
        this.cameraRigRotation = cameraRigEl.object3D.ratation.clone();

        debugger;
        if (!this.el.sceneEl.is('ar-mode')) {
            cameraRigEl.object3D.position.set(0, 0, 2);
        } else {
            cameraRigEl.object3D.position.set(0, 0, 0);
        }
    },
    onExitVR() {
        const cameraRigEl = this.cameraRigEl;

        cameraRigEl.object3D.position.copy(this.cameraRigPosition);
        cameraRigEl.object3D.rotation.copy(this.cameraRigRotation);

        cameraRigEl.object3D.rotation.set(0, 0, 0);
    },
    onTouchMove(e) {
        if (e.touches.length === 1) this.onSingleTouchMove(e);
        if (e.touches.length === 2) this.onPinchMove(e);
    },
    onSingleTouchMove(e) {
        let dX, dY;
        const modelPivotEl = this.modelPivotEl;
        this.oldClientX = this.oldClientX || evt.touches[0].clientX;
        this.oldClientY = this.oldClientY || evt.touches[0].clientY;

        dX = this.oldClientX - evt.touches[0].clientX;
        dY = this.oldClientY - evt.touches[0].clientY;

        modelPivotEl.object3D.rotation.y -= dX / 200;
        this.oldClientX = e.touches[0].clientX;

        modelPivotEl.object3D.rotation.x -= dY / 100;

        modelPivotEl.object3D.rotation.x = Math.min(Math.max(-Math.PI / 2, modelPivotEl.object3D.rotation.x), Math.PI / 2);
        this.oldClientY = e.touches[0].clientY;
    },
    onPinchMove(e) {
        const dX = e.touches[0].clientX - e.touches[1].clientX;
        const dY = e.touches[0].clientY - e.touches[1].clientY;

        const modelPivotEl = this.modelPivotEl;
        const distance = Math.sqrt(dX * dX + dY * dY);
        const oldDistance = this.oldDistance || distance;
        const distanceDifference = oldDistance - distance;
        let modelScale = this.modelScale || modelPivotEl.object3D.scale.x;

        modelScale -= distanceDifference / 500;
        modelScale = Math.min(Math.max(0.8, modelScale), 2.0);

        modelPivotEl.object3D.scale.set(modelScale, modelScale, modelScale);

        this.modelScale = modelScale;
        this.oldDistance = distance;
    },
    onTouchEnd(e) {
        this.oldClientX = undefined;
        this.oldClientY = undefined;
        if (e.touches.length < 2) this.oldDistance = undefined;
    },
    onMouseUp(e) {
        this.leftRightButtonPressed = false;
        if (e.buttons === undefined || e.buttons !== 0) return;
        this.oldClientX = undefined;
        this.oldClientY = undefined;
    },
    onMouseMove(e) {
        if (this.leftRightButtonPressed) {
            this.dragModel(e);
        } else {
            this.rotateModel(e);
        }
    },
    dragModel(e) {
        let dX, dY;
        const modelPivotEl = this.modelPivotEl;
        if (!this.oldClientX) return;
        dX = this.oldClientX - e.clientX;
        dY = this.oldClientY - e.clientY;
        modelPivotEl.object3D.position.y += dY / 200;
        modelPivotEl.object3D.position.x -= dX / 200;
        this.oldClientX = e.clientX;
        this.oldClientY = e.clientY;
    },
    rotateModel(e) {
        let dX, dY;
        const modelPivotEl = this.modelPivotEl;
        if (!this.oldClientX) return;
        dX = this.oldClientX - e.clientX;
        dY = this.oldClientY - e.clientY;
        modelPivotEl.object3D.rotation.y -= dX / 200;
        modelPivotEl.object3D.rotation.x -= dY / 200;

        modelPivotEl.object3D.rotation.x = Math.min(Math.max(-Math.PI / 2, modelPivotEl.object3D.rotation.x), Math.PI / 2);

        this.oldClientX = e.clientX;
        this.oldClientY = e.clientY;
    },
    onModelLoaded() {this.centerAndScaleModel();},
    centerAndScaleModel() {
        let box, size, center, scale;
        const {modelEl, shadowEl, titleEl} = this;
        const gltfObject = modelEl.getObject3D('mesh');

        modelEl.object3D.position.set(0, 0, 0);
        modelEl.object3D.scale.set(1.0, 1.0, 1.0);
        this.cameraRigEl.object3D.position.z = 3.0;

        modelEl.object3D.updateMatrixWorld();
        box = new THREE.Box3().setFromObject(gltfObject);
        size = box.getSize(new THREE.Vector3());

        scale = 1.6 / size.y;
        scale = 2.0 / size.x < scale ? 2.0 / size.x : scale;
        scale = 2.0 / size.z < scale ? 2.0 / size.z : scale;

        modelEl.object3D.scale.set(scale, scale, scale);

        modelEl.object3D.updateMatrixWorld();
        box = new THREE.Box3().setFromObject(gltfObject);
        center = box.getCenter(new THREE.Vector3());
        size = box.getSize(new THREE.Vector3());

        shadowEl.object3D.scale.y = size.x;
        shadowEl.object3D.scale.x = size.y;
        shadowEl.object3D.position.y = -size.y / 2;
        shadowEl.object3D.position.z = -center.z;
        shadowEl.object3D.position.x = -center.x;

        titleEl.object3D.position.x = 2.2 - center.x;
        titleEl.object3D.position.y = size.y + 0.5;
        titleEl.object3D.position.z = -2;
        titleEl.object3D.visible = true;

        modelEl.object3D.position.x = -center.x;
        modelEl.object3D.position.y = -center.y;
        modelEl.object3D.position.z = -center.z;

        if (AFRAME.utils.device.isLandscape()) this.cameraRigEl.object3D.position.z -= 1;
    },
    onMouseDown(e) {
        if (e.buttons) this.leftRightButtonPressed = e.buttons === 3;
        this.oldClientx = e.clientX;
        this.oldClientY = e.clientY;
    }
})