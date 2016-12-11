// Extended Daniel Shiffman's natureofcode example to paper.js
// https://github.com/shiffman/The-Nature-of-Code-Examples-p5.js/tree/master/chp05_libraries/box2d-html5

WebFont.load({
	google: {
		families: ['Oxygen Mono', 'Open Sans:300']
	}
});


var Box = function (x, y, color) {
	this.w = getRandomInt(5, 20);
	this.h = getRandomInt(14, 20);
	this.life = MAX_LIFE; // dies after MAX_LIFE frames, with some randomness.

	var bd = new box2d.b2BodyDef();
	bd.type = box2d.b2BodyType.b2_dynamicBody;
	bd.position = B2Helper.scaleToWorld(x,y);
	var fd = new box2d.b2FixtureDef();
	fd.shape = new box2d.b2PolygonShape();
	fd.shape.SetAsBox(B2Helper.scaleToWorld(this.w/2), B2Helper.scaleToWorld(this.h/2));
	fd.density = 1.0;
	fd.friction = 0.5;
	fd.restitution = 0.2;
	this.body = world.CreateBody(bd);
	this.body.CreateFixture(fd);
	this.body.SetLinearVelocity(new box2d.b2Vec2(getRandom(-10, 10), getRandom(2, 10)));
	this.body.SetAngularVelocity(getRandom(-5,5));

	this.paperShape = new Group();
	this.paperShape.addChild( Path.Rectangle({
		point: [0, 0],
		size: [this.w, this.h],
		strokeColor:  'black',
		fillColor:    color
	}) );
	this.paperShape.position = new Point(x, y);
	this.paperShape.transformContent = false;
};
Box.prototype = {
	killBody: function () {
		world.DestroyBody(this.body);
		this.paperShape.remove();
	},
	done: function () {
		if (this.life <= 0 || this.y > height + this.w * 2) {
			this.killBody();
			return true;
		}
		return false;
	},
	update: function (event) {
		var pos = B2Helper.scaleToPixels(this.body.GetPosition());
		var a = this.body.GetAngleDegrees();
		this.paperShape.position.x = pos.x;
		this.paperShape.position.y = pos.y;
		this.paperShape.rotate(a-this.paperShape.rotation);
		if (event.count % SHADER_FREQ === 0) { // do every half a second
			this.paperShape.opacity = Math.max(0,this.life) / MAX_LIFE;
		}
		this.life -= getRandom(0, 1);
	}
};

var Particle = function (x, y, r, fillColor, strokeColor) {
	this.x = x;
	this.y = y;
	this.r = r;
	this.fillColor = fillColor; this.strokeColor = strokeColor;
	this.isJim = false; this.isEle = false;
	this.elePic = '';
	this.life = MAX_LIFE; // dies after MAX_LIFE frames, with some randomness.
	this.captured = false;
	this.jimDead = false;
	this.age = 0;

	this.bd = new box2d.b2BodyDef();
	this.bd.type = box2d.b2BodyType.b2_dynamicBody;
	this.bd.position = B2Helper.scaleToWorld(x,y);
	this.fd = new box2d.b2FixtureDef();
	this.fd.shape = new box2d.b2CircleShape();
	this.fd.shape.m_radius = B2Helper.scaleToWorld(this.r);
	this.fd.density = 1.0;
	this.fd.friction = 0.1;
	this.fd.restitution = 0.8;
	this.body = world.CreateBody(this.bd);
	this.body.CreateFixture(this.fd);
	this.body.SetLinearVelocity(new box2d.b2Vec2(getRandom(-10, 10), getRandom(2, 10)));

	this.w = this.h = this.pastW = this.pastH = 2 * this.r;

	this.paperShape = new Path.Circle({
		center: [x, y],
		radius: this.r,
		fillColor: this.fillColor,
		strokeColor: this.strokeColor
	});
};
Particle.prototype = {
	killBody: function () {
		world.DestroyBody(this.body);
		this.paperShape.remove();
	},
	done: function () {
		if (this.life <= 0 || this.paperShape.position.y > height + 60) {
			return true;
		}
		return false;
	},
	frame: function (event) {
		var pos = B2Helper.scaleToPixels(this.body.GetPosition());
		var a = this.body.GetAngleDegrees();
		this.paperShape.position.x = pos.x;
		this.paperShape.position.y = pos.y;
		this.paperShape.rotate(a-this.paperShape.rotation);

		if (this.isJim) {
			if (this.age < 200) this.age += 1;
			// go into shop
			// if (gazebo.bounds.contains(jim.paperShape.position) && !doorLeaving) {
			// 	doorLeaving = true;
			// 	effects.push(new Effect(2));
			// }

			var dist = growCenter - this.paperShape.position;
			if (dist.length > 3000 || this.jimDead) {
				this.jimDead = false;
				this.x = growCenter.x;
				this.y = growCenter.y;
				jim.lives -= 1;
				effects.push(new Effect(4));

				world.DestroyBody(this.body);
				this.life = MAX_LIFE; // dies after MAX_LIFE frames, with some randomness.
				this.bd.position = B2Helper.scaleToWorld(this.x, this.y);
				this.fd.shape.m_radius = B2Helper.scaleToWorld(this.r);
				this.body = world.CreateBody(this.bd);
				this.body.CreateFixture(this.fd);
				this.body.SetLinearVelocity(new box2d.b2Vec2(getRandom(-10, 10), getRandom(2, 10)));
				this.paperShape.position = [this.x, this.y];
				effects.push(new Effect(1, this.paperShape.position));
			}
		}
	},
	scale: function (event) {
		if (event.count % 30 === 0) {
			world.DestroyBody(this.body);

			this.r *= stepFactorX; // could be Y instead
			this.pastW = this.w;

//			this.x = this.paperShape.position.x;
			this.x -= growCenter.x
			this.x *= stepFactorX;
			this.x += growCenter.x;

//			this.y = this.paperShape.position.y;
			this.y -= growCenter.y;
			this.y *= stepFactorY;
			this.y += growCenter.y;

			this.life = MAX_LIFE; // dies after MAX_LIFE frames, with some randomness.
			this.bd.position = B2Helper.scaleToWorld(this.x, this.y);
			this.fd.shape.m_radius = B2Helper.scaleToWorld(this.r);
			this.body = world.CreateBody(this.bd);
			this.body.CreateFixture(this.fd);
			this.body.SetLinearVelocity(new box2d.b2Vec2(getRandom(-10, 10), getRandom(2, 10)));

			this.paperShape.position = [this.x, this.y];
			this.paperShape.scale(stepFactorX);
			// this.paperShape = new Path.Circle({
			// 	center: [this.x, this.y],
			// 	radius: this.r,
			// 	fillColor: (sunset) ? 'white' : 'black',
			// 	strokeColor: (sunset) ? 'white' : 'black'
			// });
		}
	}
};

var Boundary = function (grow, x_, y_, w_, h_, angle) {
	this.x = x_;
	this.y = y_;
	this.w = w_;
	this.h = h_;
	this.pastW = this.w;
	this.pastH = this.h;
	this.angle = angle;
	this.angleCenter = 0;
	this.boundGRSum = 0;
	this.grow = grow;

	this.paperShape = new Path.Rectangle({
		point: [this.x - this.w / 2, this.y - this.h / 2],
		size: [this.w, this.h],
		fillColor: '#B0551E',
		transformContent: false
	});
	this.paperShape.rotation = this.angle;

	if (this.grow === 1) {
		boundG.addChild(this.paperShape);
		boundG.registration = growCenter;
	} else if (this.grow === 0) {
		boundGslow.addChild(this.paperShape);
		boundGslow.registration = growCenter;
	}

	this.fd = new box2d.b2FixtureDef();
	this.fd.density = 1.0;
	this.fd.friction = 0.5;
	this.fd.restitution = 0.2;
	this.bd = new box2d.b2BodyDef();
	this.bd.type = box2d.b2BodyType.b2_staticBody;
	this.bd.position = B2Helper.scaleToWorld(this.x, this.y);
	this.fd.shape = new box2d.b2PolygonShape();
	this.fd.shape.SetAsBox(B2Helper.scaleToWorld(this.w/2), B2Helper.scaleToWorld(this.h/2));
	this.body = world.CreateBody(this.bd);
	this.body.CreateFixture(this.fd);
	this.body.SetAngleDegrees(this.angle);
};
Boundary.prototype = {
	scale: function () {
		if (this.grow === -1) return;

		this.boundGRSum += boundGRotation;
		world.DestroyBody(this.body);

		this.w *= this.grow === 1 ? stepFactorX : stepFactorSlow;
		this.h *= this.grow === 1 ? stepFactorY : stepFactorSlow;
		this.pastW = this.w;
		this.pastH = this.h;
		this.x -= growCenter.x;
		this.x *= this.grow === 1 ? stepFactorX : stepFactorSlow;
		this.x += growCenter.x;
		this.y -= growCenter.y;
		this.y *= this.grow === 1 ? stepFactorY : stepFactorSlow;
		this.y += growCenter.y;

		this.bd.position = B2Helper.scaleToWorld(this.paperShape.position.x, this.paperShape.position.y);
		this.fd.shape.SetAsBox(B2Helper.scaleToWorld(this.w/2), B2Helper.scaleToWorld(this.h/2));
		this.body = world.CreateBody(this.bd);
		this.body.CreateFixture(this.fd);
		this.body.SetAngleDegrees(this.angle + this.boundGRSum);
	},
};

var Enemy = function () {
	this.landed = 0;
	this.pathPosition = Math.random();
	this.moveInAmount = 0;
	this.capePoints = 6;
	this.capeLength = 7;
	this.scoot = 0;
	this.scootAngle = Math.random() > 0.5 ? 5 : -5;
	this.restTimer = 0; this.restStop = getRandomInt(200, 1800);
	this.closestI = -1;
	this.captive = null;
	this.stoleCaptive = false;
	this.hitPoints = 3;

	this.cape = new Path({
		strokeColor: '#E4141B',
		fillColor: '#E4E030',
		// blendMode: 'lighten',
		strokeWidth: 1,
		strokeCap: 'round'
	});
	this.e = new Shape.Rectangle({
		width: 10,
		height: 10,
		fillColor: 'black'
	});
	this.e.position = new Point.random() * view.size;

	var start = this.e.position;
	for (var i = 0; i < this.capePoints; i += 1) {
		this.cape.add(start + new Point(this.capeLength, 0));
	}
};
Enemy.prototype = {
	frame: function (event) {
		if (this.e.fillColor._canvasStyle === 'rgb(255,255,255)') {
			this.e.fillColor = 'black';
		}

		switch (this.landed) {
			case 0:
				this.pathPosition += 0.01;
				if (this.pathPosition > 1) this.pathPosition = 0;
				this.e.position = enemyPath.getPointAt(this.pathPosition * enemyPath.length);
				this.moveInAmount += 0.5;
				var moveIn = growCenter - this.e.position;
				moveIn = moveIn.normalize(this.moveInAmount * boundaries[0].w / 16);
				this.e.position += moveIn;

				// collision
				for (var i = 0; i < 4; i += 1) {
					if (boundaries[i].paperShape.bounds.contains(this.e.position)) {
						this.landed = 1;
						effects.push(new Effect(3));
					}
				}

				this.cape.firstSegment.point = this.e.position;
				for (var i = 1; i < this.capePoints; i += 1) {
					var segment = this.cape.segments[i];
					var vector =  segment.previous.point - segment.point;
					segment.point += vector / 5;
				}
			break;
			case 1: // scoot
				// this.e.scale = (stepFactorX, stepFactorY);
				this.e.position -= growCenter;
				this.e.position *= stepFactorX;
				if (this.scoot < 40) {
					var vec1 = new Point(0, 0.2);
					vec1.angle = this.e.position.angle + 180;
					this.e.position += vec1;
					this.scoot += 1;
				} else {
					this.landed = 2;
				}
				this.e.position += growCenter;
				this.e.rotate(this.scootAngle);

				this.cape.firstSegment.point = this.e.position;
				for (var i = 1; i < this.capePoints; i += 1) {
					var segment = this.cape.segments[i];
					var vector = segment.previous.point - segment.point;
					segment.point += vector / 5 + [Math.random() * -2, Math.random() * 4 - 1];
				}
			break;
			case 2: // rest
				this.e.position -= growCenter;
				this.e.position *= stepFactorX;
				this.e.position += growCenter;
				if (this.restTimer < this.restStop) {
					this.restTimer += 1;
				} else {
					this.landed += 1;
					this.restTimer = 0;
				}

				this.cape.firstSegment.point = this.e.position;
				for (var i = 1; i < this.capePoints; i += 1) {
					var segment = this.cape.segments[i];
					var vector = segment.previous.point - segment.point;
					segment.point += vector / 5 + [Math.random() * -2, Math.random() * 4 - 1];
				}
			break;
			case 3: // reach for nibblet
				this.e.position -= growCenter;
				this.e.position *= stepFactorX;
				this.e.position += growCenter;

				if (this.closestI === -1) {
					if (bodies.length > 0) {
						this.closestI = Math.floor(Math.random() * bodies.length);
						if (bodies[this.closestI].captured) this.closestI = -1;
						else bodies[this.closestI].captured = true;
					}
					this.cape.firstSegment.point = this.e.position;
					for (var i = 1; i < this.capePoints; i += 1) {
						var segment = this.cape.segments[i];
						var vector = segment.previous.point - segment.point;
						segment.point += vector / 5 + [Math.random() * -2, Math.random() * 4 - 1];
					}
				} else {
					if (this.restTimer < 300) {
						this.restTimer += 1;
					} else {
						this.landed += 1;
						this.restTimer = 0;
					}
					this.cape.firstSegment.point = this.e.position;
					var vector = bodies[this.closestI].paperShape.position - this.cape.lastSegment.point;
					this.cape.lastSegment.point += vector / 20;
					for (var i = this.capePoints - 2; i > 0; i--) {
						var segment = this.cape.segments[i];
						var vector = segment.previous.point - segment.point + (segment.next.point - segment.point);
						segment.point += vector / 60 + [Math.random() * 2 - 1, Math.random() * 2 - 1];
					}
				}
			break;
			case 4: // hang onto nibblet
				if (this.restTimer < 1200) {
					this.restTimer += 1;
				} else {
					this.landed += 1;
					this.restTimer = 0;
				}
				this.cape.lastSegment.point = bodies[this.closestI].paperShape.position;
				this.e.position = this.cape.firstSegment.point;
				for (var i = this.capePoints - 2; i >= 0; i--) {
					var segment = this.cape.segments[i];
					var vector = segment.next.point - segment.point;
					segment.point += vector / 5 + [Math.random() * -2, Math.random() * 4 - 1];
				}
			break;
			case 5: // fly away
				this.pathPosition += 0.005;
				if (this.pathPosition > 1) this.pathPosition = 0;
				this.e.position = enemyPath.getPointAt(this.pathPosition * enemyPath.length);
				this.moveInAmount -= 1;
				var moveIn = growCenter - this.e.position;
				moveIn = moveIn.normalize(this.moveInAmount * boundaries[0].w / 16);
				this.e.position += moveIn;

				this.cape.firstSegment.point = this.e.position;
				if (!this.stoleCaptive) {
					this.stoleCaptive = true;
					this.captive = bodies[this.closestI].paperShape;
					world.DestroyBody(bodies[this.closestI].body);
					bodies.splice(this.closestI, 1);
					controls.updateUI();
					for (var i = 0; i < enemies.length; i += 1) {
						if (enemies[i].closestI > this.closestI) enemies[i].closestI--;
					}
					this.closestI = -1; // destroy link to bodies
				}
				this.captive.position = this.cape.lastSegment.point;
				for (var i = 1; i < this.capePoints; i += 1) {
					var segment = this.cape.segments[i];
					var vector =  segment.previous.point - segment.point;
					segment.point += vector / 5;
				}
			break;
		}
		// cape chain
		this.cape.smooth();
	},
	kill: function () {
		if (this.e.position.x < (-width - this.e.bounds.width) || this.e.position.x > (2 * viewLong + this.e.bounds.width)
			|| this.e.position.y < (-height - this.e.bounds.height) || this.e.position.y > (2 * viewLong + this.e.bounds.height)) {
			this.e.remove();
			this.cape.remove();
			return true;
		}
		return false;
	}
};

var EnemyFly = function () {
	this.rando = getRandomInt(90, 120);
	this.flightVector = new Point(1, 0.1);
	this.biting = -1;
	this.hitPoints = 100;
	this.writhing = false;

	this.paperShape = new Path({
		segments: [
			[200, 0], [-450, 50], [-200, 40], [-450, 30],[-200, 0], [-450, 10] // 3, 5, 7 are fins
		],
		fillColor: ['#191919', '#0c0c0c', '#2f2f2f', '#0c0c0c', '#141414'][Math.floor(Math.random() * 5)],
		strokeColor: 'black',
		closed: true,
		smooth: true
	});
	this.paperShape.position = [-this.paperShape.bounds.size.width, growCenter.y];
	this.paperShape.segments[5].handleOut = [200, -160];
	this.paperShape.segments[0].handleIn = [-200, -180];
	this.paperShape.segments[1].handleIn = [200, 160];
	this.paperShape.segments[0].handleOut = [-200, 180];

	for (i = 5; i >= 1; i -= 2) {
		this.paperShape.segments[i].handleIn = [30, 10];
		this.paperShape.segments[i].handleOut = [30, -10];
	}

	this.paperShape.sendToBack();
	// this.paperShape.bringToFront();


	this.paperBite = new Shape.Rectangle({size: [100, 100]});
	this.paperBite.position = this.paperShape.segments[0].point;
	// this.center = new Shape.Circle({
	// 	center: [0,0],
	// 	radius: 5,
	// 	fillColor: 'white'
	// });
};
// i can make you fire: c l c ll l llll ll l ll l
EnemyFly.prototype = {
	frame: function (event) {
		var s = this.paperShape.segments;

		s[4].point = this.paperShape.position + [-60, -20];
		s[2].point = this.paperShape.position + [-60, 20];

		for (i = 5; i >= 1; i -= 2) {
			var vector = this.paperShape.position + [-260, -10 * i + 30] - s[i].point;
			vector /= 24 * i;
			if (vector.x > 0.5) this.flightVector.length -= 0.01;
			s[i].point += vector;
		}

		if (event.count % this.rando * 2 === 0) {
			var flightAdd = new Point(Math.random() * 3, Math.random() * 2 - 1); // from -90 - 90 random amount
			this.flightVector += flightAdd;
		// } else if (event.count % 2 === 0) { // dumbo drop, drop a chair, don't let the man sit in a chair
		// 	boxes.push(new Box(this.paperShape.position.x, this.paperShape.position.y, 'green'));
		}
		if (event.count % 2 === 0) {
			if (this.biting === -1) {
				if (this.paperBite.bounds.contains(jim.paperShape.position)) {
					if (jim.age >= 200) {
						jim.age = 0;
						this.biting = 0;
						this.paperShape.add(s[0].point + [-3, -3]); // 6
						this.paperShape.add(s[0].point + [-200, 24]); // 7
						s[0].handleIn = [0, 0];
						s[6].handleIn = [-200, -130];
						this.flightVector += [2, 0]; // lunge
						this.paperShape.insertAbove(jim.paperShape);
					}
				}
			}
		} else {
			if (this.flightVector.x > 0.5) this.flightVector.length -= 0.02;
		}
		if (this.biting === 0 && s[0].point.y - s[6].point.y < 200) {
			s[6].point += this.flightVector;
			s[7].point += this.flightVector;
			s[6].point += [0.8, 0];
			s[6].point.y -= 4;
			s[0].point.y += 4;
		} else if (this.biting === 0) {
			this.biting = 1;
		}
		if (this.biting === 1 && s[0].point.y - s[6].point.y >= 32) {
				s[6].point.y += 16;
			s[0].point.y -= 16;
		} else if (this.biting === 1) {
			this.paperShape.removeSegments(6, 8);
			s[0].handleIn = [-200, -130];
			s[0].handleOut = [-200, 180];
			s[5].handleOut = [30, -10];
			this.biting = -1; // can bite again
			if (this.paperShape.bounds.contains(jim.paperShape.position)) jim.jimDead = true;
			this.paperShape.insertBelow(jim.paperShape);
		}
		if (this.writhing && this.paperShape.bounds.size.width > 400) {
			this.paperShape.bounds.size.width += -24;
			this.paperShape.position.x += 12;
		} else if (this.writhing) {
			this.writhing = false;
		}
		s[0].point += this.flightVector;
		this.paperBite.position = s[0].point + [-50, 0];
	},
	done: function () {
		if (this.paperShape.bounds.bottomLeft.x > width || this.hitPoints <= 0) {
			return true;
		}
		return false;
	}
};

var Laser = function (type) { // laser, missile
	this.type = type;
	this.segment;
	// playShoot();
	switch (this.type) {
		case 0:
			this.paperShape = new Path({
				segments: [jim.paperShape.position,
					jim.paperShape.position + controls.shootVector * 20],
				strokeColor: 'white',
				strokeWidth: 3,
				strokeCap: 'round'
			});
		break;
		case 1:
			this.closestE = -1;
			this.lifeTime = 300;
			this.paperShape = new Path({
				segments: [jim.paperShape.position,
					jim.paperShape.position + controls.shootVector * 30],
				strokeColor: 'blue',
				strokeWidth: 5,
				strokeCap: 'round'
			});
		break;
	}
	this.momentum = this.paperShape.firstSegment.next.point - this.paperShape.firstSegment.point;
	this.momentum.length = 1;
};
Laser.prototype = {
	frame: function (event) {
		var lVector = this.paperShape.firstSegment.next.point - this.paperShape.firstSegment.point;
		switch (this.type) { // how laser flies
			case 0:
				this.paperShape.position += lVector.normalize(10);
			break;
			case 1:
				// missile smoke
				if (event.count % 8 === 0) effects.push(new Effect(7, this.paperShape.segments[0].point));
				// missile homing (make them home in on the enemyFly)
				if (enemies.length > 0) {
					if (this.closestE === -1 || this.closestE > enemies.length - 1) this.closestE = Math.floor(Math.random() * enemies.length);
					var angleDiff = (enemies[this.closestE].e.position - this.paperShape.position).angle - lVector.angle;
					if (angleDiff > 0) this.paperShape.rotate(9);
					else if (angleDiff < 0) this.paperShape.rotate(-9);
				}
				var newMomentum = this.paperShape.firstSegment.next.point - this.paperShape.firstSegment.point;
				newMomentum.length = 0.2;
				this.momentum += newMomentum;
				if (this.momentum.length > 6) this.momentum.length = 6;
				this.paperShape.position += this.momentum;
				break;
			// case 2: // old missile
			// 	if (enemies.length === 0) {
			// 		this.paperShape.position += lVector.normalize(6);
			// 		break;
			// 	}
			// 	if (this.closestE === -1 || this.closestE > enemies.length - 1) this.closestE = Math.floor(Math.random() * enemies.length);
			// 	var angleDiff = (enemies[this.closestE].e.position - this.paperShape.position).angle - lVector.angle;
			// 		 if (angleDiff > 0) this.paperShape.rotate(angleDiff / 4);
			// 	else if (angleDiff < 0) this.paperShape.rotate(angleDiff / 4);
			// 	this.paperShape.position += lVector.normalize(6);
			// break;
		}
	},
	done: function () {
		switch (this.type) { // how laser DIES
			case 0:
				var dAway = this.paperShape.firstSegment.point - jim.paperShape.position;
				if (dAway.length > 700) { // too far away
					this.paperShape.remove();
					return true;
				}
			break;
			case 1:
				if (this.lifeTime === 0) { // lifetime over
					effects.push(new Effect(6, this.paperShape.position));
					this.paperShape.remove();
					return true;
				} else {
					this.lifeTime -= 1;
				}
			break;
		}

		// collision
		for (var i = 0; i < enemies.length; i += 1) {
			if (enemies[i].e.bounds.contains(this.paperShape.firstSegment.point)) {
				this.paperShape.remove();
				enemies[i].e.fillColor = 'white';
				switch (this.type) { // how laser DIES
					case 0:
						enemies[i].hitPoints -= 1;
					break;
					case 1:
						enemies[i].hitPoints -= 2;
						for (var j = 0; j < 5; j++) effects.push(new Effect(5, this.paperShape.position)); // blue debris
						effects.push(new Effect(6, this.paperShape.position));
						controls.updateUI();
					break;
				}
				if (enemies[i].hitPoints <= 0) { // should be in enemy object
					effects.push(new Effect(1, enemies[i].e.position)); // small circle
					enemies[i].e.remove();
					enemies[i].cape.remove();
					if (enemies[i].closestI !== -1) bodies[enemies[i].closestI].captured = false;
					if (enemies[i].captive) enemies[i].captive.remove(); // shot while escaping, ball fall?
					enemies.splice(i, 1);
				}
				return true;
			}
		}

		// collision
		for (var i = 0; i < enemyFlies.length; i += 1) {
			if (enemyFlies[i].paperShape.bounds.contains(this.paperShape.firstSegment.point)) {
				this.paperShape.remove();
				// enemyFlies[i].paperShape.fillColor = 'white';
				enemyFlies[i].writhing = true;
				switch (this.type) { // how laser DIES
					case 0:
						enemyFlies[i].hitPoints -= 1;
					break;
					case 1:
						enemyFlies[i].hitPoints -= 2;
						for (var j = 0; j < 5; j++) effects.push(new Effect(5, this.paperShape.position)); // blue debris
						effects.push(new Effect(6, this.paperShape.position));
					break;
				}
				if (enemyFlies[i].hitPoints <= 0) { // should be in enemy object
					effects.push(new Effect(1, enemyFlies[i].paperShape.position)); // small circle
					enemyFlies[i].paperShape.remove();
					enemyFlies[i].paperBite.remove();
					enemyFlies.splice(i, 1);
				}
				return true;
			}
		}
		return false;
	}
};
var Controls = function (jim) {
	this.jim = jim;
	this.vectorStart, this.vectorItem, this.makeTheVector = false;
	this.vector = this.shootVector = new Point(0, -1);
	this.dw = this.dd = this.ds = this.da = this.kHeld = this.daHeld = this.ddHeld = false;
	this.j = this.k = this.l = this.c = false;
	this.shift = false;
	this.pbHeight = height / 2 - 10;
	this.flagColor = uiColor, this.farJim = null;
	this.firing = true, this.firingTimer = 0;
	this.lasers = [];
	this.typedALetter = false, this.typedALetter = '', this.typePhrase = 0, this.typeLet = 0, this.fixType = 5;
	this.selectedWeapon = 0;
	this.canChangeWeapon = true;

	// powerbar display
	this.nibbletCounter = new PointText({
		content: 'nibblets: ' + bodies.length + '\nweapon: Laser' + '\nbullets: inf',
		justification: 'left',
		point: [90, 85],
		fontFamily: 'Open Sans',
		fontSize: 16,
		fillColor: uiColor
	});

	this.pbA = new Shape.Rectangle({
		width: 50,
		height: height / 2,
		fillColor: 'white'
	});
	this.pbA.position = new Point(width - 100, height / 2);
	this.pbB = new Shape.Rectangle({
		width: 40,
		height: height / 2 - 10,
		fillColor: 'pink'
	});
	this.pbB.position = new Point(width - 100, height / 2);
	this.typePaperShape = new PointText({
		content: type[level][this.typePhrase],
		justification: 'right',
		point: [width - 80, 40],
		fontFamily: 'Oxygen Mono',
		fontSize: 24,
		fillColor: uiColor
	});
	this.typeUnderline = new Path({
		segments: [this.typePaperShape.bounds.bottomLeft + [7, 0], this.typePaperShape.bounds.bottomLeft + [17, 0]],
		strokeColor: uiColor,
		strokeWidth: 1
	});
};
Controls.prototype = {
	move: function (keyDown) {
		this.vectorStart = jim.paperShape.position;
		this.vector = new Point(0, -1);
		if (this.dd || this.dw || this.da || this.ds) {
			this.vector.angle = [ -135, -90, -45, 180, 0, 0, 135, 90, 45 ]
			[(this.ds - this.dw + 1) * 3 + (this.dd - this.da + 1)];
			this.shootVector = this.vector;
		}
		if (keyDown) {
			if (this.k) { // move a lot
				if (this.pbB.size.height > (this.pbHeight * 0.4)) {
					if (!this.kHeld) {
						this.kHeld = true
						this.k = false;
						var impVec1 = (this.vector) / 2.5;
						var impVec2 = new box2d.b2Vec2(impVec1.x, impVec1.y);
						jim.body.ApplyLinearImpulse(impVec2, jim.body.GetWorldCenter());
						if (this.pbB.size.height > (0.1 * this.pbHeight)) {
							this.pbB.size.height -= 0.1 * this.pbHeight;
							this.pbB.position.y += 0.05 * this.pbHeight;
						}
					}
				}
			} else { // no k move
				if (!this.daHeld && !this.ddHeld) {
					this.daHeld = true;
					this.ddHeld = true;
					var jimVec1 = jim.body.GetLinearVelocity();
					var jimVec2 = new Point(jimVec1.x, jimVec1.y);
					jimVec2 /= 256;
					jimVec2.angle = this.vector.angle;
					var impVec2 = new box2d.b2Vec2(jimVec2.x, jimVec2.y);
					jim.body.ApplyLinearImpulse(impVec2, jim.body.GetWorldCenter());
				}
			}
		}
	},
	frame: function (event) {
		if (this.fixType >= 0) {
			this.fixType -= 1;
			this.typeUnderline.position = this.typePaperShape.bounds.bottomLeft + [7, 0];
		}
		// power bar
		if (this.pbB.size.height < (height / 2 - 10)) {
			this.pbB.size.height += 1;
			this.pbB.position.y -= 0.5;
		}
		// jim flag
		if (jim.paperShape.position.x > width ||
			jim.paperShape.position.x < 0 ||
			jim.paperShape.position.y > height ||
			jim.paperShape.position.y < 0) {
			var max = Point.max(new Point(60, 40), jim.paperShape.position);
			var position = Point.min(max, new Point(width, height) - [60, 40]);
			if (!this.farJim) {
				this.farJim = new PointText({
					content: 'jim',
					justification: 'center',
					point: position,
					fontFamily: 'Open Sans',
					fontSize: 20,
					fillColor: this.flagColor
				});
			} else {
				this.farJim.position = position;
				var dist = growCenter - jim.paperShape.position;
				this.farJim.content = 'jim\n' + Math.round(dist.length);
			}
		} else {
			if (this.farJim) {this.farJim.remove(); this.farJim = null}
		}

		// fire bullets
		if (this.l) {
			if (this.firingTimer < 20) this.firingTimer += 1;
			else { this.firingTimer = 0; this.firing = true; }
			if (this.firing) {
				this.firing = false;
				if (this.selectedWeapon !== 1 || this.lasers.length <= 4) {
					this.lasers.push(new Laser(this.selectedWeapon));
					controls.updateUI();
				}
			}
		}

		if (this.c && this.canChangeWeapon) {
			this.canChangeWeapon = false;
			if (this.selectedWeapon < 1) {
				this.selectedWeapon += 1;
			} else {
				this.selectedWeapon = 0;
			}
			this.updateUI();
		}
	},
	updateUI: function () {
		controls.nibbletCounter.content = 'nibblets: ' + bodies.length + '\nweapon: ' + ['Laser', 'Missile'][this.selectedWeapon] + '\nbullets: ';
		controls.nibbletCounter.content += (this.selectedWeapon === 1) ? 5 - this.lasers.length : 'inf';
	},
	keyDown: function (event) {
		// console.log(event.key);
		var letter, cLetter;
		switch (event.key) {
			case 'pause':
				paused = !paused; break;
			case 'w':
				this.dw = true; this.move(); break;
			case 'd':
				this.dd = true; this.move(true); break;
			case 's':
				this.ds = true;	this.move(true); break;
			case 'a':
				this.da = true;	this.move(true); break;
			case 'k':
				this.k = true; this.move(true); break;
			case 'l':
				this.l = true; break;
			case 'j':
				this.j = true; break;
			case 'shift':
				this.shift = true; break;
			case 'c':
				this.c = true; break;
		}
		if (event.key !== 'shift') letter = event.key === 'space' ? ' ' : event.key.substring(0, 1);
		if (event.key !== 'shift' && event.key !== 'space') letter = this.shift ? event.key.toUpperCase() : event.key;

		cLetter = type[level][this.typePhrase].substring(this.typeLet, this.typeLet + 1);
		if (letter === cLetter) {
			if (this.typeLet === type[level][this.typePhrase].length - 1 && this.typePhrase < type[level].length - 1) { // go to a new phrase if it exists
				this.typePhrase += 1;
				this.typeLet = 0;
				this.typePaperShape.content = type[level][this.typePhrase];
				this.typeUnderline.position.x = this.typePaperShape.bounds.bottomLeft.x + 7;
			} else {
				this.typeLet += 1;
				this.typeUnderline.position.x += 14.4;
			}
		}
	},
	keyUp: function (event) {
		switch (event.key) {
			case 'k':
				this.kHeld = false; break;
			case 'w':
				this.dw = false; this.move(false); break;
			case 'd':
				this.dd = false; this.move(false); this.ddHeld = false; break;
			case 's':
				this.ds = false; this.move(false); break;
			case 'a':
				this.da = false; this.move(false); this.daHeld = false; break;
			case 'l':
				this.l = false; this.firingTimer = 0; this.firing = true; break;
				// this.misslingTimer = 0; this.missling = true;
			case 'j':
				this.j = false; break;
			case 'shift':
				this.shift = false; break;
			case 'enter':
				if (loginShown) $('form[name="login"]').submit();
				break;
			case 'c':
				this.c = false;
				this.canChangeWeapon = true;
				break;
		}
	},
	mouseDown: function (event) {
	},
	mouseDrag: function (event) {
	},
	mouseUp: function (event) {
	}
};

var Text = function (words) {
	this.tg = new Group();
	this.textOn = true;

	this.words = words;
	this.si = si;
	this.index = 0;
	this.loadText(this.words[this.si][0]);
};
Text.prototype = {
	constructor: Text,
	loadText: function () {
	// check to see if si changed, if it has, then make index 0;
		this.si = si;
		var string = this.words[this.si][this.index];

		this.tg.remove();
		this.tg = new Group();
		var pieces = string.split('#');
		for (var i = 0; i < pieces.length; i++) {
			var text = new PointText({
				point: new Point(0.1, 0) * view.size + [0, i * 40],
				justification: 'right',
				fillColor: 'white',
				content: pieces[i],
				fontFamily: 'Open Sans',
				fontSize: 30
			});
			this.tg.addChild(text);
		}
		this.tg.position = [0, view.bounds.height / 2];
	},
	frame: function (event) {
		var p = 64;
		this.tg.bounds.point.x = boundaries[0].x - this.tg.bounds.width - p;
	}
};

var GameBuilder = function () {
	this.size = new Size(boundaries[0].w, boundaries[0].h);
	this.position = null;
	this.pastPos = null;
	this.shapeExists = false;
	this.angleRate = 0;
	this.angle = 0;
};
GameBuilder.prototype = {
	build: function () {
		var newB = new Boundary(false, this.position.x, this.position.y, this.size.width, this.size.height, this.angle);
		// boundaries.push(newB); // build jim's house
		// boundG.addChild(newB.paperShape);
		// boundG.registration = growCenter;
		// var scaleFactor = boundaries[0].h / 20;
		// $('.text-box').append('boundaries.push(new Boundary(false, growCenter.x + ' + pos.x + ', growCenter.y + ' + pos.y + ', ' +
		// 	size.width + ', ' + size.height + ', ' + this.angle + '));<br>');

		boundaries.push(newB); // build outside structures
		boundGslow.addChild(newB.paperShape);
		boundGslow.registration = growCenter;
// if i use this, it gets small, but it's in the right position


		var scaleFactor = boundaries[0].h / height * boundaries[0].h / 100;

		var pos = this.position - growCenter;
		pos /= scaleFactor;
		var size = this.size / scaleFactor;
		$('.text-box').append('boundaries.push(new Boundary(false, growCenter.x + ' + pos.x + ', growCenter.y + ' + pos.y + ', ' +
			size.width + ', ' + size.height + ', ' + this.angle + '));<br>');

		// find the position when house is big, then find where it is when it's small
		// factor for house when it's big
	},
	draw: function () {
		// creates the shape to be drawn by paper.js
		this.paperShape = new Shape.Rectangle({
			point: this.position - this.size / 2,
			size: this.size,
			fillColor: 'white'
		});
		this.paperShape.rotate(this.angle);
	},
	scale: function () {
		this.size *= [stepFactorX, stepFactorY];
		this.pastSize = new Size(this.size.width, this.size.height);
		this.position -= growCenter;
		this.position *= stepFactorX;
		this.position += growCenter;
	},
	killBody: function () {
		this.paperShape.remove();
		this.shapeExists = false;
	},
	frame: function (event) {
		if (this.shapeExists) {
			this.paperShape.size = this.size;
			this.paperShape.rotate(this.angleRate);
			this.angle += this.angleRate;
		}
	},
	mouseMove: function (event) {
		if (this.shapeExists) {
			this.position = event.point;
			this.paperShape.position = this.position;
		}
	},
	keyUp: function (event) {
		if (event.key === 'shift') {
			this.killBody();
		}
		this.angleRate = 0;
	},
	keyDown: function (event) {
		if (event.key === 'shift' && !this.shapeExists) { // draw shape once
			this.position = getMousePoint();
			this.draw();
			this.shapeExists = true;
		} else if (event.key === 'q') {
			growPaused = !growPaused;
		} else if (this.shapeExists) {
			switch (event.key) {
				case 'enter':
					build(); break;
				case 'a':
					this.size.width += 2; break;
				case 'z':
					this.size.width -= 2; break;
				case 's':
					this.size.height += 2; break;
				case 'x':
					this.size.height -= 2; break;
				case 'd':
					this.angleRate = 1; break;
				case 'c':
					this.angleRate = -1; break;
			}
		}
	}
};

var Effect = function (index, point) {
	this.index = index;
	this.point = point;

	switch (this.index) {
		case 0: // concentric circles
			this.paperShape = new Path.Circle({
				center: this.point,
				radius: 1,
				strokeColor: '#FADCFA',
				strokeWidth: 5
			});
		break;
		case 1: // concentric circle fast
			this.paperShape = new Path.Circle({
				center: this.point,
				radius: 1,
				strokeColor: '#FADCFA',
				strokeWidth: 2
			});
		break;
		case 2: // black circle
			this.paperShape = new CompoundPath({
				children: [
					new Path.Circle({
						center: jim.paperShape.position,
						radius: 10000,
					}),
					new Path.Circle({
						center: jim.paperShape.position,
						radius: viewLong / 2,
					})
				],
				fillColor: 'black'
			});
		break;
		case 3: // flash
			this.flashed = false;
			this.paperShape = new Shape.Rectangle({
				point: [0, 0],
				size: view.size,
				fillColor: 'white'
			});
		break;
		case 4: // lives
			this.paperShape = new PointText({
				point: growCenter,
				content: 'Lives: ' + jim.lives,
				justification: 'center',
				fontFamily: 'Open Sans',
				fontSize: 200,
				fillColor: uiColor
			});
			this.paperShape.bounds.size = [width, height];
			this.paperShape.bounds.point = [0, 0];
			this.timerStart = -1;
		break;
		case 5: // one blue shrapnel (push many for a cloud)
			this.rotate5 = parseInt(Math.random() * 10 + 5); // 4 - 14
			this.vector5 = new Point(0, 5);
			this.color5 = Math.random() < 0.5 ? 'white' : 'blue';
			this.vector5.angle = getRandomInt(135, 225);
			this.paperShape = new Path({
				segments: [this.point, this.point + [13, 0]],
				strokeColor: this.color5,
				strokeWidth: 3,
				strokeCap: 'round'
			});
			this.paperShape.rotate(getRandomInt(-90, 90));
			// this.paperShape.fullySelected = true;
		break;
		case 6: // missile implosion
			this.paperShape = new Shape.Circle({
				center: this.point,
				radius: 20,
				fillColor: 'red',
				opacity: 0.5
			});
		break;
		case 7: // smoke
			this.paperShape = new Shape.Circle({
				center: this.point,
				radius: Math.random() * 6,
				fillColor: 'white',
				opacity: 0.4
			});
		break;
		case 8: // bubble
		break;
	}
};
Effect.prototype = {
	frame: function (event) {
		switch (this.index) {
			case 0:
				this.paperShape.scale(1.06);
				this.paperShape.position -= growCenter;
				this.paperShape.position *= stepFactorX;
				this.paperShape.position += growCenter;
			break;
			case 1:
				this.paperShape.scale(1.2);
				this.paperShape.position -= growCenter;
				this.paperShape.position *= stepFactorX;
				this.paperShape.position += growCenter;
			break;
			case 2:
				this.paperShape.children[1].scale(0.9);
				this.paperShape.position = jim.paperShape.position;
			break;
			case 4:
				if (this.timerStart === -1) this.timerStart = event.count;
			break;
			case 5:
				this.paperShape.opacity -= 0.01;
				this.paperShape.rotate(this.rotate5);
				this.paperShape.position += this.vector5;
			break;
			case 6:
				this.paperShape.scale(0.9);
				// this.paperShape.position -= growCenter;
				// this.paperShape.position *= stepFactorX;
				// this.paperShape.position += growCenter;
			break;
			case 7:
				this.paperShape.opacity -= 0.05;
				this.paperShape.position.x -= 1;
			break;
		}
	},
	done: function (event) {
		switch (this.index) {
			case 0:
				if (this.paperShape.bounds.size.width > width) return true;
				return false;
			case 1:
				if (this.paperShape.bounds.size.width > width) return true;
				return false;
			case 2:
				if (this.paperShape.children[1].bounds.size.width <= 5) {
					gamePlay.clear();
					return true;
				}
				return false;
			case 3:
				if (this.flashed === true) return true;
				this.flashed = true;
				return false;
			case 4:
				if (event.count - this.timerStart > 100) return true;
				return false;
			case 5: // fallthrough
			case 7:
				if (this.paperShape.opacity <= 0) return true;
				return false;
			case 6:
				if (this.paperShape.bounds.size.width < 0.1) return true;
				return false;
		}
	}
};

var GreatOne = function () {
	this.appearing = true;
	this.paperShape = new Group();
	this.flash = new Shape.Rectangle({
		point: [0, 0],
		size: [width, height],
		fillColor: 'white',
		opacity: 0
	});
};
GreatOne.prototype = {
	appear: function (point) {
		this.flash.opacity = 1;
		for (var i = 0; i < 5; i += 1) {
			this.paperShape.addChild(new Raster('greatOne'));
			this.paperShape.children[i].rotation = i * 180 / 5;
		}
		this.paperShape.position = point;
		this.paperShape.scale(10);
	},
	retire: function () {
		this.appearing = false;
		this.flash.opacity = 1;
		this.paperShape.removeChildren();
	},
	frame: function (event) {
		if (this.flash.opacity > 0.01) this.flash.opacity -= 0.01;
		else if (this.flash.opacity !== 0) {
			this.flash.opacity = 0;
			this.appearing = true;
		}
		if (this.appearing) this.paperShape.rotate(-0.6);
	}
};

var GamePlay = function (event) {
	this.black = null;
	this.loggingIn = false;
	this.doorsClosing = -1;
	this.waitToRegister = false;
	this.registerForm = null;
	this.room = -1 // room is where you are, level is how far you are
}
GamePlay.prototype = {
	build: function (room) { // constructor
		this.room = room;
		doorLeaving = false;
		paused = false;
		switch (this.room) {
			case -2: // shop
				boundaries.push(new Boundary(-1, width * 0.2, height * 0.5, width * 0.2, 20, 0));
				boundaries.push(new Boundary(-1, width * 0.4, height - 10, width * 0.2, 20, 0));
				boundaries.push(new Boundary(-1, width * 0.5, height - 10, width * 0.2, 20, 0));
				boundaries.push(new Boundary(-1, width * 0.5, height - 10, width * 0.2, 20, 0));
				this.shop = new Raster('shop');
				this.shop.position = growCenter;
			break;
			case -1: // stewardship
				boundaries.push(new Boundary(-1, width * 0.2, height * 0.5, width * 0.2, 20, 0));
				boundaries.push(new Boundary(-1, width * 0.4, height - 10, width * 0.2, 20, 0));
				boundaries.push(new Boundary(-1, width * 0.5, height - 10, width * 0.2, 20, 0));
				boundaries.push(new Boundary(-1, width * 0.5, height - 10, width * 0.2, 20, 0));
				this.paypal = new PointText({
						content: 'STEWARDSHIP\nDonate or Pay your penance',
						point: growCenter,
						fontFamily: 'Open Sans',
						fontWeight: 'normal',
						fontSize: 24,
						fillColor: uiColor,
						justification: 'center'
				});
			break;
			case 0:
				boundaries.push(new Boundary(-1, width * 0.2, height * 0.5, width * 0.2, 20, 0));
				boundaries.push(new Boundary(-1, width * 0.4, height - 10, width * 0.2, 20, 0));
				boundaries.push(new Boundary(-1, width * 0.5, height - 10, width * 0.2, 20, 0));
				boundaries.push(new Boundary(-1, width * 0.6, height - 10, width * 0.2, 20, 0));
				boundaries.push(new Boundary(-1, width * 0.8, height * 0.5, width * 0.2, 20, 0));
				var idol = new Raster('idol'); idol.scale(0.5);
				idol.bounds.point = [growCenter.x * 0.3, height - idol.bounds.size.height - 10];

				var content = ['Register', 'Shop', 'Play', 'Stewardship'];
				if (window.loggedIn) content.push('Logout');
				if (!window.loggedIn) content.push('Login');
				for (var i = 0; i < boundaries.length; i += 1) {
					doorNames.push(new PointText({
						content: content[i],
						point: boundaries[i].paperShape.position + [0, -doorHeight - 30],
						fontFamily: 'Open Sans',
						fontWeight: 'normal',
						fontSize: 24,
						fillColor: uiColor,
						justification: 'center'
					}));
					doors.push(new Shape.Rectangle({
						point: boundaries[i].paperShape.position + [-doorWidth / 2, -doorHeight-10],
						size: [doorWidth, doorHeight],
						fillColor: 'black'
					}));
				}

				for (var j = 1; j < 4; j++) { // close doors
					doorsClosed.push(new Shape.Rectangle({
						point: doors[j].bounds.topLeft,
						size: [doorWidth, window.loggedIn ? 101 : 0],
						fillColor: '#696969'
					}));
				}
				if (!window.loggedIn) this.doorsClosing = 1;
				else this.doorsClosing = 0;

				keyboard = new Raster('keyboard');
				keyboard.position = growCenter + [0, -80];
				// keyboard.scale(0.5);
				keyboard.sendToBack();

				boundaries.push(new Boundary(-1, width / 2, height - 10, width, 20, 0));
				boundaries.push(new Boundary(-1, -2200, height - 1050, 5000, 20, 25));
				boundaries.push(new Boundary(-1, width + 2200, height - 1050, 5000, 20, -25));
			break;
			case 1:
				boundaries.push(new Boundary(1, growCenter.x-10, growCenter.y, 1, 20, 0));
				boundaries.push(new Boundary(1, growCenter.x+10, growCenter.y, 1, 20, 0));
				boundaries.push(new Boundary(1, growCenter.x-5, growCenter.y-10, 10, 1, 0));
				boundaries.push(new Boundary(1, growCenter.x, growCenter.y+10, 20, 1, 0));
				boundaries.push(new Boundary(1, growCenter.x + -1.6666666666666516, growCenter.y + -5.963541666666677, 0.16666666666666025, 17.916666666666664, 98));
				boundaries.push(new Boundary(1, growCenter.x + 1.3541666666666867, growCenter.y + -3.7239583333333397, 0.16666666666666025, 17.916666666666664, 98));
				boundaries.push(new Boundary(1, growCenter.x + -1.3541666666666512, growCenter.y + -2.3697916666666705, 0.16666666666666025, 17.916666666666664, 98));
				boundaries.push(new Boundary(0, growCenter.x + 222.51437571964047, growCenter.y + 80.85377595402516, 6.618888824351414, 95.660599765615146, -90));

				for (var i = 0; i < 11; i += 1) {
					var b = new Particle(growCenter.x, growCenter.y + 10, 3, 'red', 'black');
					bodies.push(b);
				}

				enemyPath = new Path.Circle({
					center: growCenter,
					radius: 42,
				});
				text = new Text(words);
				gazebo = new Raster('gazebo');
				gazebo.position = growCenter + [222, 33];
				gazebo.scale(0.5);
				boundGslow.addChild(gazebo);
				boundGslow.registration = growCenter;
			break;
			case 2:
				// level 2
			break;
		}
		// initialize level
		jim = new Particle(growCenter.x, growCenter.y, 1, uiColor, uiColor);
		jim.isJim = true;
		jim.lives = 15;
		controls = new Controls(jim);
		gameB = new GameBuilder();

		fps_data = new PointText({
			content: 60,
			point: [8, 24],
			fontFamily: 'Open Sans',
			fontWeight: 'normal',
			fontSize: 16,
			fillColor: uiColor,
			justification: 'left',
		});
		fps_data.prevTimeStamp = 0.0;
	},
	clear: function () {
		project.activeLayer.removeChildren();
		boundG.remove();
		boundGslow.remove();
		boundG = new Group();
		boundGslow = new Group();
		boundG.transformContent = true;
		boundGslow.transformContent = true;

		for (var i = 0; i < boundaries.length; i += 1) {
			world.DestroyBody(boundaries[i].body);
		}
		boundaries.length = bodies.length = enemies.length = 0;

		switch (doorNumber) {
			case 1: this.build(-2); break;
			case 2: this.build(level); break;
			case 3: this.build(-1); break;
		}
	},
	frame: function (event) {
		// greatOne.appear(new Point(width, 0) + [-40, 40]);
		// greatOne.retire();
		if (this.loggingIn && window.loggedIn) {
			this.loggingIn = false;
			this.black.remove();
			this.clear();
		} else if (this.loggingIn) {
			this.black.bringToFront();
		}
		if (this.doorsClosing === 1) {
			for (var i = 0; i < doorsClosed.length; i++) {
				if (doorsClosed[i].size.height < doorHeight) {
					doorsClosed[i].size.height += 1;
					doorsClosed[i].position.y += 0.5;
				} else {
					this.doorsClosing = -1;
				}
			}
		} else if (this.doorsClosing === 0) {
			for (var i = 0; i < doorsClosed.length; i++) {
				if (doorsClosed[i].size.height > 0) {
					doorsClosed[i].size.height -= 1;
					doorsClosed[i].position.y -= 0.5;
				} else {
					this.doorsClosing = -1;
				}
			}
		}
		switch (this.room) {
			case 0: // build level select
				if (event.count % 1000 === 0) {
					if (enemies.length < 6) {
						enemyFlies.push(new EnemyFly());
						// enemyFlies[enemyFlies.length - 1].paperShape.insertBelow(jim.paperShape);
					}
				}

				if (controls.j && !doorLeaving) {
					out:
					for (var i = 0; i < doors.length; i++) {
						if (doors[i].bounds.contains(jim.paperShape.position)) {
							doorNumber = i;
							switch (i) {
								case 0: // register
									doorLeaving = true;
									paused = true;
									$('#rRegister').modal('show');
								break out;
								case 1: // shop
								case 2: // play
								case 3: // stewardship
									if (window.loggedIn) {
										doorLeaving = true;
										paused = true;
										effects.push(new Effect(2)); // circle transition
									} else {
										// todo: play 'nope' sound
									}
								break out;
								case 4: // logout/login
									doorLeaving = true;
									if (window.loggedIn) {
										this.logout();
									} else {
										paused = true;
										$('#rLogin').modal('show');
									}
								break out;
							}
						}
					}
				}
			break;
			case 1:
				if (event.count % 1000 === 0) {
					if (enemies.length < 6) { // whales
						enemyFlies.push(new EnemyFly());
						// enemyFlies[enemyFlies.length - 1].paperShape.insertBelow(jim.paperShape);
					}
				}
				if (event.count % 2200 === 0) { // cirling enemies
					if (enemies.length < 6) {
						enemies.push(new Enemy());
					}
				}
				if (event.count % 500 === 0) { // elephants
					if (elephants.length < 6) {
						elephants.push(new Particle(growCenter.x, 100, 50));
						elephants[elephants.length - 1].elePic = new Raster('elephant');
						elephants[elephants.length - 1].elePic.scale(0.58);
						elephants[elephants.length - 1].elePic.position;
//						elephants[elephants.length - 1].registration += [115, 115];
					}
				}
			break;
		}
	},
	login: function () {
		// // this.clear();
		// $.ajax({
		// 	context: this,
		// 	type: 'POST',
		// 	url: 'api/process_login.php',
		// 	data: {
		// 		username: $('input[name="username"]').val(),
		// 		password: $('input[name="password"]').val(),
		// 		ajaxMode: 'true'
		// 	},
		// 	success: function (result) {
		// 		var resultJSON = processJSONResult(result);
		// 		userInfo = resultJSON;
		// 		if (resultJSON['errors'] && resultJSON['errors'] > 0) {
		// 			alertWidget('login-display-alerts');
		// 		} else { /*window.location.replace('account');*/ }
		// 		$('#rLogin').modal('hide');
		// 		window.loggedIn = true;
		// 		doorNumber = null;
		// 		doorLeaving = false;
		// 		doorNames[4].content = 'Logout';
		// 		this.doorsClosing = 0;
		// 		paused = false;
		// 	}
		// });
	},
	logout: function () {
		// var url = 'account/logout.php';
		// $.ajax({
		// 	context: this,
		// 	type: 'GET',
		// 	url: url,
		// 	success: function () {
		// 		window.loggedIn = false;
		// 		doorNumber = null;
		// 		setTimeout(function () {
		// 			doorLeaving = false;
		// 		}, 1000);
		// 		doorNames[4].content = 'Login';
		// 		this.doorsClosing = 1;

		// 		if (this.waitToRegister) {
		// 			this.waitToRegister = false;
		// 			this.register2();
		// 		}
		// 	}
		// });
	},
	register1: function (form) {
		this.registerForm = form;
		var errorMessages = validateFormFields('newUser');
		if (errorMessages.length > 0) {
			$('#register-display-alerts').html('');
			$.each(errorMessages, function (idx, msg) {
				$('#register-display-alerts').append('<div class="alert alert-danger">' + msg + '</div>');
			});
		} else {
			if (window.loggedIn) { this.waitToRegister = true; this.logout(); }
			else { this.register2(); }
		}
	},
	register2: function () {
		// var form = this.registerForm;
		// // Process form
		// // Serialize and post to the backend script in ajax mode
		// var serializedData = form.serialize();
		// serializedData += '&ajaxMode=true';
		// $.ajax({
		// 	context: this,
		// 	type: 'POST',
		// 	url: 'api/create_user.php',
		// 	data: serializedData
		// }).done(function (result) {
		// 	var resultJSON = processJSONResult(result);
		// 	if (resultJSON['errors'] && resultJSON['errors'] > 0) {
		// 		console.log('error');
		// 		// Reload captcha
		// 		var img_src = 'api/generate_captcha.php?' + new Date().getTime();
		// 		$.ajax({
		// 			type: 'GET',
		// 			url: img_src,
		// 			dataType: 'text'
		// 		}).done(function (result) {
		// 			$('#captcha').attr('src', result);
		// 			form.find('input[name="captcha"]' ).val('');
		// 			alertWidget('register-display-alerts');
		// 			return;
		// 		});
		// 	} else {
		// 		$('#rRegister').modal('hide');
		// 		setTimeout(function () {
		// 			paused = true;
		// 		}, 500);
		// 		$('#rLogin').modal('show');
		// 	}
		// });
	}
};

var words = [
	[
		'This is#Jim',
		'this is#Jim\'s house',
		'Jim sure wishes',
		'that they\'d#STOP MESSING#WITH THE SIZE#OF HIS HOUSE!',
		'But what#can Jim do?',
		'Call and make#a complaint?',
		'File a#restraining#order?',
		'Please..',
		'Jim knows he#can\'t do that',
		'He\'s just a ',
		''
	],
	[
		'Jim wishes life#could be easier',
		'Like when he#lived in Mexico',
		'That was a#simple lifestyle',
		'Just pay off#the druglords',
		'And they left#you alone',
		''
	],
	[
		'This reminds Jim of the time he was a scout for the USO',
		''
	],
];
var type = [
	[
		'type me', 'that\'s it', 'keep going!'
	],
	[
		'Hey!', 'Typing makes the Great One happy.', 'type type type', 'as fast as your little arms can go.',
		'To the West and to the South,', 'to the Ancillary and to the Didactic,', 'Jim\'s house stretches far and wide.',
		'It stretch, stretch, streches', 'into a rubberband house', 'into a gingerbread baby', 'Who is responsible for this crime?',
		'Jim can\'t sleep with all this racket!', 'Jim has sensitive ears!', 'shhhhhhhhhhhhhhhhhhhhhhhhhhh'
	],
	[
		'Every time things slow down or stop...', 'it means the Warnockle is feeding.', 'It\'s favorite food is-- you guessed it.',
		'Fresh nibblets'
	]
];

////////////////////////////////////////////////////////////////////////////////////////////

// BACK-END HANDLERS
var mousePoint;
$('body').mousemove(function () {
	mousePoint = new Point(event.pageX, event.pageY);
	$('.cursor').text(event.pageX + ', ' + event.pageY).css('left', event.pageX).css('top', event.pageY - 20);
});

$('form[name="login"]').submit(function (e) {
	e.preventDefault();
	gamePlay.login();
});
$('form[name="newUser"]').submit(function (e) {
	e.preventDefault();
	var form = $(this);
	gamePlay.register1(form);
});

var loginShown = false;
$('#rLogin').on('shown.bs.modal', function() {
	loginShown = true;
});
$('#rLogin').on('hidden.bs.modal', function() {
	paused = false;
	doorLeaving = false;
	loginShown = false;
});
$('#rRegister').on('hidden.bs.modal', function() {
	paused = false;
	doorLeaving = false;
});

// GLOBALS
// timestep (1 frame = 1 / 60 fps)
var timeStep = 1.0/60, MAX_LIFE = 200, SHADER_FREQ = 20, world = B2Helper.createWorld();
var boundaries = [], bodies = [], enemies = [], enemyFlies = [], effects = [], boxes = [], elephants = [];
var width = view.size.width, height = view.size.height, viewLong = width > height ? width : height;
var grow = true, growPaused = false, growCenter = new Point(width/2, height/2);
var stepFactorX, stepFactorY, stepFactorSlow;
var growFactorX = 1, growFactorY = 1;
var clickTime = 0, si = 0, level = 1, enemyPath, paused = false, boundGRotation = 0;
var sunset = true, shadeSlow = true, shade1 = 227, shade2 = 158, shade3 = 188, uiColor = 'black';
var greatOne = new GreatOne();
var doors = [], doorsClosed = [], doorNames = [], doorWidth = 50, doorHeight = 100, doorLeaving = false, doorNumber;
var jim, controls, text, gameB;
var sndShoot;
var gazebo, keyboard;
var boundG = new Group(), boundGslow = new Group();
boundG.transformContent = true;
boundGslow.transformContent = true;
//boundGRotation = 0.2;

var gamePlay = new GamePlay();
gamePlay.build(0);

setInterval(function () {
	sunset = !sunset;
}, 300000);





function onFrame(event) {
	for (var i = 0; i < effects.length; i += 1) {
		effects[i].frame(event);
		if (effects[i].done(event)) {
			effects[i].paperShape.remove();
			effects.splice(i, 1);
		}
	}

	if (paused) return;

	var fps = Math.round(600 / (event.time - fps_data.prevTimeStamp)) / 10;
	if ((event.count + 1) % 60 === 0) {
		fps_data.content = fps;
		fps_data.prevTimeStamp = event.time;
	}

	world.Step(timeStep, 10, 10); // 2nd and 3rd arguments are velocity and position iterations

	// global boundaries (left and bottom) can't be changed or all hell breaks loose
	stepFactorX = (boundaries[3].pastW + growFactorX) / boundaries[3].pastW;
	stepFactorY = (boundaries[0].pastH + growFactorY) / boundaries[0].pastH;
	stepFactorSlow = stepFactorX;
	stepFactorSlow -= 1;
	stepFactorSlow /= 5;
	stepFactorSlow += 1;

	if (!growPaused) {
		// grow and shrink Jim's house
		for (var i = 0; i < boundaries.length; i += 1) {
			boundaries[i].scale();
		}
		boundG.rotation = boundGRotation;
		boundG.scale(stepFactorX, stepFactorY);
		boundGslow.scale(stepFactorSlow, stepFactorSlow);
		if ((grow && boundaries[0].h >= height) || (!grow && boundaries[0].h <= 40)) {
			grow = !grow;
			growFactorX *= -1;
			growFactorY *= -1;
			if ((text.index + 1) < text.words[text.si].length) {
				text.index += 1;
				text.loadText();
			}
		}
		gameB.scale();
	}
	gameB.frame(event);

	for (var i = 0; i < bodies.length; i += 1) {
		bodies[i].frame(event);
		// bodies[i].scale(event);
		if (bodies[i].done()) {
			bodies.splice(i, 1);
			controls.updateUI();
		}
	}
	for (var i = 0; i < boxes.length; i += 1) {
		boxes[i].update(event);
		if (boxes[i].done()) {
			boxes.splice(i, 1);
		}
	}
	for (var i = 0; i < enemies.length; i += 1) {
		enemies[i].frame(event);
		if (enemies[i].kill()) {
			if (enemies[i].captive) enemies[i].captive.remove();
			enemies.splice(i, 1);
		}
	}
	if (enemyPath) {
		enemyPath.bounds.width *= stepFactorX;
		enemyPath.bounds.height *= stepFactorY;
		enemyPath.position = growCenter;
	}

	jim.frame(event);
	controls.frame(event);
	if (text) text.frame(event);
	greatOne.frame(event);
	gamePlay.frame(event);

	for (var i = 0; i < enemyFlies.length; i += 1) {
		enemyFlies[i].frame(event);
		if (enemyFlies[i].done()) {
			enemyFlies[i].paperShape.remove();
			enemyFlies.splice(i, 1);
		}
	}
	for (var i = 0; i < elephants.length; i += 1) {
		elephants[i].frame(event);
		elephants[i].elePic.position = elephants[i].paperShape.position;
		var a = elephants[i].body.GetAngleDegrees();
		elephants[i].elePic.rotate(a-elephants[i].elePic.rotation);
		if (elephants[i].done()) {
			elephants[i].killBody(); // also removes papershape
			elephants[i].elePic.remove();
			elephants.splice(i, 1);
		}
	}

	for (var i = 0; i < controls.lasers.length; i += 1) {
		controls.lasers[i].frame(event);
		if (controls.lasers[i].done()) {
			controls.lasers.splice(i, 1);
		}
	}

	// sunset
	$('body').css('background', 'rgb(' + shade1 + ',' + shade2 + ',' + shade3 + ')');
	shadeSlow = !shadeSlow;
	if (shade2 > 0 && sunset && shadeSlow) {
		shade1 -= 1; shade2 -= 1; shade3 -= 1;
		if (shade2 === 130) {
			if (gamePlay.room === 0) {
				for (var i = 0; i < doorNames.length; i += 1) {
					doorNames[i].fillColor = 'white';
				}
			}
			uiColor = fps_data.fillColor = jim.paperShape.fillColor = jim.paperShape.strokeColor = 'white';
			controls.flagColor = controls.typePaperShape.fillColor = controls.typeUnderline.strokeColor = 'white';
			controls.nibbletCounter.fillColor = 'white';
			if (controls.farFlag) controls.jimFlag.fillColor = 'white';
		}
	} else if (shade2 < 158 && !sunset) {
		shade1 += 1; shade2 += 1; shade3 += 1;
		if (shade2 === 50) {
			if (gamePlay.room === 0) {
				for (var i = 0; i < doorNames.length; i += 1) {
					doorNames[i].fillColor = 'black';
				}
			}
			uiColor = fps_data.fillColor = jim.paperShape.fillColor = jim.paperShape.strokeColor = 'black';
			controls.flagColor = controls.typePaperShape.fillColor = controls.typeUnderline.strokeColor = 'black';
			controls.nibbletCounter.fillColor = 'black';
			if (controls.farFlag) controls.jimFlag.fillColor = 'black';
		}
	}
}

function onMouseDown(event) {
	controls.mouseDown(event);
}
function onMouseUp(event) {
	controls.mouseUp(event);
}
function onMouseDrag(event) {
	controls.mouseDrag(event);
}
function onMouseMove(event) {
	gameB.mouseMove(event);
}
function onKeyDown(event) {
	// console.log(event.key);
	gameB.keyDown(event);
	controls.keyDown(event);
	if(event.key === 'y') {
	}
}
function onKeyUp(event) {
	gameB.keyUp(event);
	controls.keyUp(event);
}


function fnPreventBackspace(event) {if (event.keyCode == 8) {return false;}}
function fnPreventBackspacePropagation(event) {if (event.keyCode == 8) {event.stopPropagation();} return true;}
$(document).keypress(fnPreventBackspace);
$(document).keydown(fnPreventBackspace);
$('input').keypress(fnPreventBackspacePropagation);
$('input').keydown(fnPreventBackspacePropagation);
$('textarea').keypress(fnPreventBackspacePropagation);
$('textarea').keydown(fnPreventBackspacePropagation);

function BufferLoader(context, urlList, callback) {
	this.context = context;
	this.urlList = urlList;
	this.onload = callback;
	this.bufferList = new Array();
	this.loadCount = 0;
}
BufferLoader.prototype.loadBuffer = function (url, index) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';
	var loader = this;
	request.onload = function () {
		loader.context.decodeAudioData(
			request.response,
			function (buffer) {
				if (!buffer) {
					alert('error decoding file data: ' + url);
					return;
				}
				loader.bufferList[index] = buffer;
				if (loader.loadCount += 1 == loader.urlList.length)
					loader.onload(loader.bufferList);
			},
			function (error) {
				console.error('decodeAudioData error', error);
			}
		);
	}
	request.onerror = function () {
		alert('BufferLoader: XHR error');
	}
	request.send();
}
BufferLoader.prototype.load = function () {
	for (var i = 0; i < this.urlList.length; i += 1)
		this.loadBuffer(this.urlList[i], i);
}
init();
var context;
var bufferLoader;
function init() {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	context = new AudioContext();
	bufferLoader = new BufferLoader(
		context, [
		],
		finishedLoading
	);
	bufferLoader.load();
}
function finishedLoading(bufferList) { // not needed?
	// callback
}
function playShoot() {
	sndShoot = context.createBufferSource();
	sndShoot.buffer = bufferLoader.bufferList[3];
	sndShoot.connect(context.destination);
	sndShoot.start(0);
}

// my functions
function getRandom(min, max) {
	return Math.random() * (max - min) + min;
}
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
function getRandomColor() {
	var c = new Color(Math.random(), Math.random(), Math.random());
	return c;
}
function getMousePoint() {
	return mousePoint;
}
