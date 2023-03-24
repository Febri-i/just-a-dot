const c = document.getElementById("canvas");
c.width = c.getBoundingClientRect().width;
c.height = c.getBoundingClientRect().height;

alert(
	"Use your up and down arrow key to change speed, left and right key for changing color. Pefresh the page to change the pattern"
);

const ctx = c.getContext("2d");

class Particle {
	posx = 0;
	posy = 0;
	velocity = 0;
	dirx = 0;
	diry = 0;
	lastposx = 0;
	lastposy = 0;
	constructor(x, y) {
		this.init(x, y);
	}

	init(x, y) {
		this.posx = x;
		this.posy = y;
		this.lastposx = x;
		this.lastposy = y;
		const initangle = perlin.get(this.posx * 0.001, this.posy * 0.001) * (Math.PI * 4);
		this.dirx = Math.sin(initangle);
		this.diry = Math.cos(initangle);
	}
	accel(speed) {
		this.velocity += speed;
	}
	affect(angle) {
		this.dirx += Math.sin(angle);
		this.diry += Math.cos(angle);
		this.normalizeDir();
	}

	normalizeDir() {
		const mag = Math.sqrt(this.dirx ** 2 + this.diry ** 2);
		this.dirx /= mag;
		this.diry /= mag;
	}

	setPosition(x, y) {
		this.posx = x;
		this.posy = y;
	}
	update() {
		this.lastposx = this.posx;
		this.lastposy = this.posy;
		this.posx += this.dirx * this.velocity;
		this.posy += this.diry * this.velocity;

		this.affect(perlin.get(this.posx * 0.001, this.posy * 0.001) * (Math.PI * 4));
		if (
			this.posx > window.innerWidth + 100 ||
			this.posx < -100 ||
			this.posy < -100 ||
			this.posy > window.innerHeight + 100
		) {
			this.init(Math.random() * (c.width + 200) - 100, Math.random() * (c.height + 200) - 100);
		}
	}
}

let particles = [];
const maxparticle = 1500;
const maxLifetime = 5;
const particleRadius = 1;
let isRgb = false;
let strokeColor = "rgba(255,255,255,0.05)";

const colorlist = [
	() => {
		isRgb = false;
		strokeColor = "rgba(255,255,255,0.05)";
	},
	() => {
		isRgb = true;
	},
];
for (let i = 0; i < maxparticle; i++) {
	particles.push(
		new Particle(Math.random() * c.width, Math.random() * c.height, Math.random() * maxLifetime, 0)
	);
}

let lastTime = 0;
function loop(timestamp) {
	const delta = timestamp - lastTime;
	update(timestamp, delta);
	draw(delta);
	lastTime = timestamp;
	window.requestAnimationFrame(loop);
}

loop(0);

function drawParticle(ctx, particle) {
	ctx.beginPath();
	ctx.moveTo(particle.lastposx, particle.lastposy);
	ctx.lineTo(particle.posx, particle.posy);
	ctx.stroke();
	ctx.closePath();
}
for (let i = 0; i < particles.length; i++) {
	const particle = particles[i];
	particle.accel(3);
}

function update(timestamp, delta) {
	for (let i = 0; i < particles.length; i++) {
		const particle = particles[i];
		particle.update(timestamp, delta);
	}
}

function draw() {
	for (let i = 0; i < particles.length; i++) {
		const particle = particles[i];
		if (isRgb) {
			const colindex = i % 4;
			ctx.strokeStyle = `rgba(${colindex == 1 ? 255 : 0},${colindex == 2 ? 255 : 0},${
				colindex == 3 ? 255 : 0
			},0.5)`;
		} else {
			ctx.strokeStyle = strokeColor;
		}

		drawParticle(ctx, particle);
	}
}
function refresh() {
	c.width = window.innerWidth;
	c.height = window.innerHeight;
	ctx.clearRect(0, 0, c.width, c.height);
}
window.addEventListener("resize", () => {
	refresh();
});

let colorindex = 0;

window.addEventListener("keydown", (e) => {
	console.log(e.code);
	if (e.code == "ArrowLeft") {
		colorindex--;
		if (colorindex < 0) {
			console.log(colorindex);
			colorindex = colorlist.length - 1;
		}
		colorlist[colorindex]();
		refresh();
	} else if (e.code == "ArrowRight") {
		colorindex++;
		if (colorindex >= colorlist.length) {
			colorindex = 0;
		}

		colorlist[colorindex]();
		refresh();
	}

	if (e.code == "ArrowUp") {
		for (let i = 0; i < particles.length; i++) {
			const particle = particles[i];
			particle.accel(1);
		}
	} else if (e.code == "ArrowDown") {
		for (let i = 0; i < particles.length; i++) {
			const particle = particles[i];
			particle.accel(-1);
		}
	}
});
