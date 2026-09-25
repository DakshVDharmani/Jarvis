import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/+esm";

export function createSphere() {
    const geometry = new THREE.SphereGeometry(1, 64, 64); 
    //3d shape of the sphere 

    const material = new THREE.MeshStandardMaterial({
        color: 0x00ff88, 
        emissive: 0x003d22, 
        emissiveIntensity: 1.5, 
        roughness: 0.25, 
        metalness: 0.7,
        //gives Jarvis the metal-like appearance 
        transparent: true, 
        opacity: 0.85, 
        //controls the transparency 
        wireframe: false, 
        //keeps it solid
        side: THREE.DoubleSide
        //renders both outside and inside surfaces 
    }); 
    //appearance through material 

    const sphere = new THREE.Mesh(geometry, material);

    const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff88, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.3,
        depthWrite: false, 
        //helps render elements that are under it, used when multiple overlapping layers 
        side: THREE.DoubleSide
    }); 

    const wireSphere = new THREE.Mesh(geometry, wireMaterial); 
    wireSphere.scale.set(1.03, 1.03, 1.03); 
    sphere.add(wireSphere); 

    sphere.userData.wireSphere = wireSphere; 
    sphere.userData.baseScale = 1; 
    sphere.userData.rotationSpeed = 0.002; 
    sphere.userData.pulseSpeed = 0.002; 

    wireSphere.rotation.y = Math.PI/4; 
    
    sphere.position.set(0, 0, 0); 

    sphere.rotation.x = 0; 
    sphere.rotation.y = 0; 

    sphere.castShadow = true;
    sphere.receiveShadow = true; 

    return sphere; 

}

export function updateSphere(sphere, time){
    sphere.rotation.y += sphere.userData.rotationSpeed; 
    //rotates the position of the sphere 

    const pulse = 1 + Math.sin(time*sphere.userData.pulseSpeed)*0.03;
    //gives subtle breathing animation  
    sphere.scale.setScalar(pulse); 

}