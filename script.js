const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 768;
const COLLISION_COLOR = "#ff0000";
const MOUSE_OVER_COLOR = "#00ff00";
const DEFAULT_COLOR = "#eeeeee";
const OUTLINE_COLOR = "#cccccc";

const canvas = document.querySelector("canvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const c = canvas.getContext("2d");
const m = [];
const mouse = { x: 0, y: 0, clicked: false };

class Node {
  constructor(x, y, width, outline, fill) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.outline = outline;
    this.fill = fill;
    this.collision = false;
    this.mouseOver = false;
  }
}

class NodeMatrix {
  constructor(canvasWidth, canvasHeight, nodeWidth, context) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.nodeWidth = nodeWidth;
    this.c = context;
    this.rows = Math.floor(canvasHeight / nodeWidth);
    this.columns = Math.floor(canvasWidth / nodeWidth);
    this.nodes = [];
    this.lastTargetNode = new Node();
    this.initialize();
  }

  update({ x: mouseX, y: mouseY, clicked }) {
    let targetNodej = Math.floor(mouseX / this.nodeWidth);
    let targetNodei = Math.floor(mouseY / this.nodeWidth);
    let targetNode =
      this.nodes[
        targetNodei < this.nodes.length ? targetNodei : this.nodes.length - 1
      ][
        targetNodej < this.nodes[0].length
          ? targetNodej
          : this.nodes[0].length - 1
      ];
    if (clicked) {
      targetNode.collision = true;
    }
    if (targetNode != this.lastTargetNode) {
      this.lastTargetNode.mouseOver = false;
      targetNode.mouseOver = true;
      this.lastTargetNode = targetNode;
    }
  }

  draw() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.c.fillStyle = this.nodes[i][j].outline;
        this.c.fillRect(
          this.nodes[i][j].x,
          this.nodes[i][j].y,
          this.nodes[i][j].width,
          this.nodes[i][j].width
        );
        if (this.nodes[i][j].collision) {
          this.nodes[i][j].fill = COLLISION_COLOR;
        } else if (this.nodes[i][j].mouseOver) {
          this.nodes[i][j].fill = MOUSE_OVER_COLOR;
        } else this.nodes[i][j].fill = DEFAULT_COLOR;
        this.c.fillStyle = this.nodes[i][j].fill;
        this.c.fillRect(
          this.nodes[i][j].x + 1,
          this.nodes[i][j].y + 1,
          this.nodes[i][j].width - 2,
          this.nodes[i][j].width - 2
        );
      }
    }
  }

  initialize() {
    for (let i = 0; i < this.rows; i++) {
      const row = [];
      for (let j = 0; j < this.columns; j++) {
        const node = new Node(
          j * this.nodeWidth,
          i * this.nodeWidth,
          this.nodeWidth,
          OUTLINE_COLOR,
          DEFAULT_COLOR
        );
        row.push(node);
      }
      this.nodes.push(row);
    }
  }
}

const resetCanvas = function (context) {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};
const matrix = new NodeMatrix(CANVAS_WIDTH, CANVAS_HEIGHT, 10, c);

const update = function () {
  resetCanvas(c);
  matrix.update(mouse);
  matrix.draw();
  window.requestAnimationFrame(update);
};

update();

window.addEventListener("mousemove", (e) => {
  mouse.x = Math.floor(e.offsetX);
  mouse.y = Math.floor(e.offsetY);
});

window.addEventListener("mousedown", (e) => {
  mouse.clicked = true;
});

window.addEventListener("mouseup", (e) => {
  mouse.clicked = false;
});
