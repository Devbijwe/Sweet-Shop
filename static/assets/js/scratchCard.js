(function($) {
    var ScratchCard = function(element, options) {
        this.element = $(element);

        this.param = {};
        this.param.backgroundColor = options.backgroundColor || '#95a5a6';
        this.param.tipsColor = options.tipsColor || '#999999';
        this.param.tips = options.tips || "Scratch here to win";
        this.param.btnContent = options.btnContent || "";
        this.param.btnCallback = options.btnCallback || function() {};
        this.param.prompt = options.prompt || "Better luck next time.";
        this.param.showButton = options.showButton || false;
        // Private parameters
        this.fontem = parseInt(window.getComputedStyle(document.documentElement, null)["font-size"]);
        this.shakeDuration = 300; // Duration of the shake animation in milliseconds
        this.shakeIntensity = 10; // Intensity of the shake (number of pixels)
        this.shaking = false;

        this._init();
    };

    ScratchCard.prototype = {
        constructor: ScratchCard,
        _init: function() {
            this._initHTML();
            this._initCanvas();
            this._initEvent();
            this._initShake();
        },
        setBtnAndPrompt: function(options) {
            var that = this;
            if (options.btnContent) {
                that.element.find(".info span[name='scratchCardBtn']").html(options.btnContent);
            }
            if (options.prompt) {
                that.element.find(".info span[name='scratchCardPrompt']").html(options.prompt);
            }
            if (options.btnCallback) {
                this.param.btnCallback = options.btnCallback;
            }
        },
        reset: function() {
            this.isDone = false;
            this._initCanvas();
        },
        _initEvent: function() {
            var canvas = this.canvas;

            var that = this;
            canvas.addEventListener("mousemove", function(e) {
                that._eventMove(e);
            }, false);
            canvas.addEventListener("mousedown", function(e) {
                that._eventDown(e);
            }, false);
            canvas.addEventListener("mouseup", function(e) {
                that._eventUp(e);
            }, false);
            canvas.addEventListener('touchstart', function(e) {
                e.preventDefault();
                that._eventDown(e);
            }, false);
            canvas.addEventListener('touchend', function(e) {
                e.preventDefault();
                that._eventUp(e);
            }, false);
            canvas.addEventListener('touchmove', function(e) {
                e.preventDefault();
                that._eventMove(e);
            }, false);
            that.element.find(".info span[name='scratchCardBtn']").click(function() {
                if (that.param.btnCallback) {
                    that.param.btnCallback();
                }
            });
        },
        _initHTML: function() {
            var e = this.element;
            e.addClass('scratchCard');
            var buttonStyle = this.param.showButton ? '' : 'display: none;';
            var html = '<div class="info">' +
                '<span class="prompt" name="scratchCardPrompt">' + this.param.prompt + '</span>' +
                '<span class="btn" name="scratchCardBtn" style="' + buttonStyle + '">' + this.param.btnContent + '</span>' +
                '</div>' +
                '<canvas name="scratchCardCanvas" class="scratchCardCanvas"></canvas>';
            e.append(html);
        },
        _initCanvas: function() {
            this.canvas = this.element.find("canvas[name='scratchCardCanvas']")[0];
            var canvas = this.canvas;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            this.ctx = canvas.getContext("2d");
            var ctx = this.ctx;

            // Load the image for scratching
            var image = new Image();
            image.src = '/static/assets/scratch/Diwali.png'; // Adjust the image path

            image.onload = function() {
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = 'destination-out';
            };

            ctx.fillStyle = this.param.backgroundColor;
            ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            ctx.fill();

            ctx.font = "Bold 30px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = this.param.tipsColor;
            ctx.fillText(this.param.tips, canvas.width / 2, canvas.height / 2);
        },

        _eventDown: function(e) {
            e.preventDefault();
            this.isMouseDown = true;
        },
        _eventUp: function(e) {
            e.preventDefault();
            var canvas = this.canvas;
            var ctx = this.ctx;
            var a = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var j = 0;
            for (var i = 3; i < a.data.length; i += 4) {
                if (a.data[i] == 0) j++;
            }
            if (j >= a.data.length / 20) {
                this.isDone = true;
                $(".scratchCard").css("opacity", "0.5");

                animate();
                this._shakeContainer(); // Trigger container shake after scratching
            }
            this.isMouseDown = false;
        },
        _eventMove: function(e) {
            e.preventDefault();
            var canvas = this.canvas;
            var ctx = this.ctx;
            if (this.isMouseDown) {
                if (e.changedTouches) {
                    e = e.changedTouches[e.changedTouches.length - 1];
                }
                var topY = this.element[0].offsetTop;
                var oX = canvas.offsetLeft,
                    oY = canvas.offsetTop + topY;
                var x = (e.clientX + document.body.scrollLeft || e.pageX) - oX || 0,
                    y = (e.clientY + document.body.scrollTop || e.pageY) - oY || 0;
                ctx.beginPath();
                ctx.arc(x, y, this.fontem * 1.2, 0, Math.PI * 2, true);
                canvas.style.display = 'none';
                canvas.offsetHeight;
                canvas.style.display = 'inherit';
                ctx.fill();
            }
            if (this.isDone) {



                // Set z-index for the button
                this.element.find('.btn').css({ 'z-index': 3 });
            }

        },
        // Define the _shakeContainer function
        _shakeContainer: function() {
            var that = this;
            var container = that.element;

            if (!that.shaking) {
                that.shaking = true;
                var startTime = Date.now();

                // Create an animation loop for the container shake
                (function shakeLoop() {
                    var elapsed = Date.now() - startTime;

                    if (elapsed < that.shakeDuration) {
                        // Calculate the new container position
                        var offsetX = (Math.random() - 0.5) * 2 * that.shakeIntensity;
                        var offsetY = (Math.random() - 0.5) * 2 * that.shakeIntensity;

                        // Apply the transform to the container
                        container.css('transform', `translate(${offsetX}px, ${offsetY}px)`);

                        // Request the next frame of the animation
                        requestAnimationFrame(shakeLoop);
                    } else {
                        // End the shake animation
                        container.css('transform', 'translate(0, 0)');
                        that.shaking = false;
                    }
                })();
            }
        },
    };

    $.fn.scratchCard = function(option) {
        var args = Array.apply(null, arguments);
        args.shift();
        var internal_return;
        this.each(function() {
            var $this = $(this),
                data = $this.data('ScratchCard'),
                options = typeof option == 'object' && option;
            if (!data) {
                $this.data('ScratchCard', (data = new ScratchCard(this, $.extend({}, $.fn.scratchCard.defaults, options))));
            }
            if (typeof option == 'string' && typeof data[option] == 'function') {
                internal_return = data[option].apply(data, args);
                if (internal_return !== undefined) {
                    return false;
                }
            }
        });
        if (internal_return !== undefined)
            return internal_return;
        else
            return this;
    };

    $.fn.scratchCard.defaults = {};
})(jQuery);
const canvas = document.getElementById("fireworks-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas, false);

class Firework {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.sx = Math.random() * 3 - 1.5;
        this.sy = Math.random() * -3 - 3;
        this.size = Math.random() * 2 + 1;
        this.shouldExplode = false;

        const colorVal = Math.round(0xffffff * Math.random());
        const r = colorVal >> 16;
        const g = (colorVal >> 8) & 255;
        const b = colorVal & 255;
        this.r = r;
        this.g = g;
        this.b = b;
    }

    update() {
        if (
            this.sy >= -2 ||
            this.y <= 100 ||
            this.x <= 0 ||
            this.x >= canvas.width
        ) {
            this.shouldExplode = true;
        } else {
            this.sy += 0.01;
        }
        this.x += this.sx;
        this.y += this.sy;
    }

    draw() {
        ctx.fillStyle = `rgb(${this.r},${this.g},${this.b})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, r, g, b) {
        this.x = x;
        this.y = y;
        this.sx = Math.random() * 3 - 1.5;
        this.sy = Math.random() * 3 - 1.5;
        this.size = Math.random() * 2 + 1;
        this.life = 100;
        this.r = r;
        this.g = g;
        this.b = b;
    }

    update() {
        this.x += this.sx;
        this.y += this.sy;
        this.life -= 1;
    }

    draw() {
        ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.life / 100})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

const fireworks = [new Firework()];
const particles = [];

// Create an audio element
const audio = new Audio('/static/assets/music/firework-1-29803.mp3');
audio.loop = true; // Set the audio to loop

function playAudio() {
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
    });
}

function stopAudio() {
    audio.pause();
    audio.currentTime = 0;
}


function animate() {

    playAudio();
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < 0.05) {
        fireworks.push(new Firework());
    }

    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].draw();

        if (fireworks[i].shouldExplode) {
            for (let j = 0; j < 50; j++) {
                particles.push(
                    new Particle(
                        fireworks[i].x,
                        fireworks[i].y,
                        fireworks[i].r,
                        fireworks[i].g,
                        fireworks[i].b
                    )
                );
            }
            fireworks.splice(i, 1);
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
    requestAnimationFrame(animate);
}