import { ref, onUnmounted } from "vue";

export function useSketchCanvas(canvasEl: Ref<HTMLCanvasElement | null>) {
  const fabricCanvas = ref<any>(null);

  const pencilCursor =
    'url("data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
      <path d="M3 17.25V21h3.75L19.81 7.94l-3.75-3.75L3 17.25z" fill="black"/>
     </svg>`,
    ) +
    '") 16 16, crosshair';

  const eraserCursor =
    'url("data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
      <rect x="4" y="8" width="16" height="8" fill="red"/>
     </svg>`,
    ) +
    '") 16 16, crosshair';

  const init = async (width = 600, height = 500) => {
    const fabric = await import("fabric");

    if (!canvasEl.value) return;

    if (fabricCanvas.value) {
      fabricCanvas.value.dispose();
      fabricCanvas.value = null;
    }

    fabricCanvas.value = new fabric.Canvas(canvasEl.value, {
      isDrawingMode: true,
      width,
      height,
      backgroundColor: "#fff",
      selection: false,
    });

    fabricCanvas.value.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas.value);
    fabricCanvas.value.freeDrawingBrush.width = 2;
    fabricCanvas.value.freeDrawingBrush.color = "#222";
  };

  const loadTemplate = async (url: string) => {
    const fabric = await import("fabric");

    const { objects, options } = await fabric.loadSVGFromURL(url);
    const validObjects = objects.filter((o): o is NonNullable<typeof o> => o !== null);
    const group = fabric.util.groupSVGElements(validObjects, options);

    group.set({ selectable: false, evented: false, lockMovementX: true, lockMovementY: true, hasControls: false, hasBorders: false });

    const maxW = fabricCanvas.value.getWidth() - 40;
    const maxH = fabricCanvas.value.getHeight() - 40;
    const scaleX = maxW / (group.width || 1);
    const scaleY = maxH / (group.height || 1);
    group.scale(Math.min(scaleX, scaleY, 1));

    fabricCanvas.value.add(group);
    fabricCanvas.value.centerObject(group);
    fabricCanvas.value.sendToBack(group);
    fabricCanvas.value.renderAll();
  };

  // ponytail: load photo as non-selectable background, draw on top
  const loadImage = async (dataUrl: string) => {
    const fabric = await import("fabric");

    const img = await fabric.FabricImage.fromURL(dataUrl, { crossOrigin: "anonymous" });

    const maxW = fabricCanvas.value.getWidth() - 20;
    const maxH = fabricCanvas.value.getHeight() - 20;
    const scaleX = maxW / (img.width || 1);
    const scaleY = maxH / (img.height || 1);
    img.scale(Math.min(scaleX, scaleY, 1));

    img.set({ selectable: false, evented: false, lockMovementX: true, lockMovementY: true, hasControls: false, hasBorders: false });

    fabricCanvas.value.add(img);
    fabricCanvas.value.centerObject(img);
    fabricCanvas.value.sendToBack(img);
    fabricCanvas.value.renderAll();
  };

  const setMode = (mode: "draw" | "select" | "erase") => {
    if (!fabricCanvas.value) return;

    const brush = fabricCanvas.value.freeDrawingBrush;
    const el = fabricCanvas.value.upperCanvasEl;

    if (mode === "select") {
      fabricCanvas.value.isDrawingMode = false;
      fabricCanvas.value.selection = true;
      fabricCanvas.value.getObjects().forEach((o: any) => {
        if (o.lockMovementX) return; // skip background image/template
        o.set({ selectable: true, evented: true });
      });
      el.style.cursor = "move";
    } else {
      fabricCanvas.value.selection = false;
      fabricCanvas.value.getObjects().forEach((o: any) => {
        o.set({ selectable: false, evented: false });
      });

      if (mode === "erase") {
        fabricCanvas.value.isDrawingMode = true;
        brush.width = 16;
        brush.color = "#fff";
        el.style.cursor = eraserCursor;
      } else {
        fabricCanvas.value.isDrawingMode = true;
        brush.width = 2;
        brush.color = "#222";
        brush.globalCompositeOperation = "source-over";
        el.style.cursor = pencilCursor;
      }
    }
  };

  const undo = () => {
    const objs = fabricCanvas.value?.getObjects();
    if (objs?.length) fabricCanvas.value.remove(objs[objs.length - 1]);
  };

  const clear = () => {
    fabricCanvas.value?.getObjects().forEach((o: any) => {
      fabricCanvas.value.remove(o);
    });
  };

  const exportPNG = (): string => fabricCanvas.value?.toDataURL({ format: "png" }) ?? "";

  const setDimensions = (width: number, height: number) => {
    fabricCanvas.value?.setDimensions({ width, height });
  };

  onUnmounted(() => fabricCanvas.value?.dispose());

  return { init, loadTemplate, loadImage, setMode, undo, clear, exportPNG, setDimensions };
}
