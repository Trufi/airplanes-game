import { AnimationPerFrame, AnimationType, AnimationRepeatType } from '../types';
import * as THREE from 'three';
import { MeshBasicMaterial } from 'three';

export const createAnimation = (
  duration: number,
  cooldown: number,
  type: AnimationType,
  repeat: AnimationRepeatType,
): AnimationPerFrame => {
  return {
    duration,
    cooldown,
    frames: 0,
    is_running: false,
    type,
    repeat,
  };
};

interface Actions {
  visible?: () => void;
  hide?: () => void;
  repeat?: () => void;
  end?: () => void;
}

const _action = (animation: AnimationPerFrame, actions: Actions) => {
  if (animation.is_running) {
    animation.frames += 1;

    // console.log(animation.frames % animation.cooldown);
    if (animation.frames % animation.cooldown < animation.duration) {
      if (actions.visible) {
        actions.visible();
      }
    } else if (
      animation.repeat != 'always' &&
      animation.frames / animation.cooldown > animation.repeat
    ) {
      animation.is_running = false;
      animation.frames = 0;
      if (actions.repeat) {
        actions.repeat();
      }
    } else if (animation.frames % animation.cooldown > animation.duration) {
      if (actions.hide) {
        actions.hide();
      }
    }
  } else {
    animation.frames = 0;
    if (actions.end) {
      actions.end();
    }
  }
};

export const actionShowHide = (animation: AnimationPerFrame, obj: THREE.Object3D) => {
  _action(animation, {
    visible: () => (obj.visible = true),
    hide: () => (obj.visible = false),
    end: () => (obj.visible = false),
  });
};

const material = new MeshBasicMaterial();
const prevMaterials: Map<string, THREE.Material> = new Map();
material.color.setHex(0xcc4444);

export const actionFireFlash = (animation: AnimationPerFrame, obj: THREE.Scene) => {
  const setNew = (children: THREE.Object3D[]) => {
    children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        if (!prevMaterials.has(child.name)) {
          prevMaterials.set(child.name, child.material.clone());
          child.material = material;
        }
      } else if (child.children.length) {
        setNew(child.children);
      }
    });
  };
  const setOld = () => {
    prevMaterials.forEach((material, name) => {
      let child = obj.getObjectByName(name) as THREE.Mesh;
      if (child) {
        child.material = material;
        prevMaterials.delete(name);
      }
    });
  };

  _action(animation, {
    visible: () => setNew(obj.children),
    hide: setOld,
    end: setOld,
  });
};

export const updateAnimation = (
  animation: AnimationPerFrame,
  obj: THREE.Object3D | THREE.Scene | undefined,
) => {
  switch (animation.type) {
    case 'fireflash':
      if (obj instanceof THREE.Scene) {
        actionFireFlash(animation, obj);
      }
      break;
    case 'shoot':
      if (obj) {
        actionShowHide(animation, obj);
      }
      break;
  }
};
