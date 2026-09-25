import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/+esm";

function createParticleTexture(){
    const canvas = document.createElement("canvas"); 
    canvas.width = 64; 
    canvas.height = 64; 

    const context = canvas.getContext("2d"); 

    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32); 
    gradient.addColorStop(0, "rgba(0, 255, 136, 1)"); 
    gradient.addColorStop(0.4, "rgba(0, 255, 136, 0.8)"); 
    gradient.addColorStop(1, "rgba(0, 255, 136, 0)"); 

    context.fillStyle = gradient; 
    context.beginPath(); 

    context.arc(32, 32, 30, 0, Math.PI*2); 
    context.fill(); 

    const texture = new THREE.CanvasTexture(canvas); 
    texture.needsUpdate = true; 

    return texture; 
}
//helper function for createparticles 

export function createParticles(){
    const geometry = new THREE.BufferGeometry; 

    const particleCount = 300; 
    const position = new Float32Array(particleCount*3); 

    for(let i = 0; i<particleCount; i++){
        const index = i*3; 
        //three as every particle needs x, y, z 

        const radius = 1.5 + Math.random()*1.5; 
        //keeps distance from the center 

        const theta = Math.random()*Math.PI*2; 
        const phi = Math.acos(2*Math.random()-1); 

        position[index] = radius*Math.sin(phi)*Math.cos(theta)*1.5; 
        //calculates position of x 
        position[index+1] = radius*Math.sin(phi)*Math.sin(theta)*0.65; 
        //calculates position of y 
        position[index+2] = radius*Math.cos(phi); 
        //calculates position of z 
    }

    geometry.setAttribute(
        "position", 
        new THREE.BufferAttribute(position, 3)
    ); 

    const particleTexture = createParticleTexture(); 

    const material = new THREE.PointsMaterial({
        color: 0x00ff88, 
        size: 0.015, 
        transparent: true, 
        opacity: 0.65, 
        deepWrite: false, 
        map: particleTexture
    }); 

    const particles = new THREE.Points(geometry, material); 

    particles.userData.rotationSpeed = 0.00015; 
    particles.userData.baseOpacity = 0.65; 

    return particles; 
}

export function updateParticles(particles, time){
    particles.rotation.y += particles.userData.rotationSpeed; 
    particles.rotation.x = Math.sin(time*0.0001)*0.08; 
}