const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 768;
const COLLISION_COLOR = "#ff0000";
const MOUSE_OVER_COLOR = "#00ff00";
const DEFAULT_COLOR = "#eeeeee";
const OUTLINE_COLOR = "#cccccc";
const NODE_WIDTH = 15;
const START_COLOR = "#aa00ff";
const END_COLOR = "#0000ff";

const canvas = document.querySelector("canvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const c = canvas.getContext("2d");
const m = [];
const mouse = { x: 0, y: 0, clicked: false };
const calculatingRoute = false;
let PATH = [];

class Node {
  constructor(x, y, width, outline, fill) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.outline = outline;
    this.fill = fill;
    this.collision = false;
    this.mouseOver = false;
    this.start = false;
    this.end = false;
    this.f = 0;
    this.g = 0;
    this.neighbours = [];
    this.previous = null;
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
    this.nodes = new Array(this.rows)
      .fill(0)
      .map(() => new Array(this.columns).fill(0));
    this.lastTargetNode = new Node();
    this.initialize();
    this.haveStart = false;
    this.haveEnd = false;
    this.start = null;
    this.end = null;
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
      if (!this.haveEnd && !targetNode.collision) {
        if (this.haveStart && !targetNode.start) {
          targetNode.end = true;
          this.haveEnd = true;
          this.end = targetNode;
        } else {
          targetNode.start = true;
          this.haveStart = true;
          this.start = targetNode;
        }
      }
      if (!targetNode.end && !targetNode.start) targetNode.collision = true;
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
        if (this.nodes[i][j].start) {
          this.nodes[i][j].fill = START_COLOR;
        } else if (this.nodes[i][j].end) {
          this.nodes[i][j].fill = END_COLOR;
        } else if (this.nodes[i][j].collision) {
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
        if (PATH.length > 0 && PATH.includes(this.nodes[i][j])) {
          this.c.fillStyle = "black";
          this.c.fillRect(
            this.nodes[i][j].x + 1,
            this.nodes[i][j].y + 1,
            this.nodes[i][j].width - 2,
            this.nodes[i][j].width - 2
          );
        }
      }
    }
  }

  initialize() {
    for (let i = 0; i < this.rows; i++) {
      // const row = [];
      for (let j = 0; j < this.columns; j++) {
        const node = new Node(
          j * this.nodeWidth,
          i * this.nodeWidth,
          this.nodeWidth,
          OUTLINE_COLOR,
          DEFAULT_COLOR
        );
        this.nodes[i][j] = node;
        // row.push(node);
        if (j > 0) {
          this.nodes[i][j - 1].neighbours.push(node);
          node.neighbours.push(this.nodes[i][j - 1]);
        }
        if (i > 0) {
          this.nodes[i - 1][j].neighbours.push(node);
          node.neighbours.push(this.nodes[i - 1][j]);
        }
      }
      // this.nodes.push(row);
    }
  }
}

const resetCanvas = function (context) {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};
const matrix = new NodeMatrix(CANVAS_WIDTH, CANVAS_HEIGHT, NODE_WIDTH, c);

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

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

window.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (e.key == " ") {
    PATH = aStar(matrix.start, matrix.end, h);
  }
});

function h(start, n) {
  return (
    start.x / start.width +
    start.y / start.width +
    n.x / n.width +
    n.y / n.width
  );
}

function aStar(start, end, h) {
  const openSet = new Array();
  const cameFrom = new Array();
  openSet.push(start);

  start.g = 0;
  start.f = h(start, end);
  while (openSet.length > 0) {
    let current = openSet.reduce((prev, current) =>
      prev.f < current.f ? prev : current
    );

    if (current == end) {
      let curr = current;
      const path = [];
      while (curr.previous) {
        path.push(curr);
        curr = curr.previous;
      }
      path.forEach((node) => {
        node.fill = "black";
      });
      return path;
    }

    openSet.splice(openSet.indexOf(current), 1);
    cameFrom.push(current);
    current.neighbours.forEach((neighbour) => {
      if (!cameFrom.includes(neighbour)) {
        let tempG = current.g + h(neighbour, current);
        let bestGScore = false;
        if (!openSet.includes(neighbour) && !neighbour.collision) {
          bestGScore = true;
          openSet.push(neighbour);
        } else if (tempG < neighbour.g) {
          bestGScore = true;
        }

        if (bestGScore) {
          neighbour.previous = current;
          neighbour.g = tempG;
          neighbour.f = neighbour.g + h(neighbour, end);
        }
      }
    });
  }
  console.log(openSet);
  console.log("no path found!");
}
