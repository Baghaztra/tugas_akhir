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

  const init = async (templateUrl?: string) => {
    const fabric = await import("fabric");

    if (!canvasEl.value) return;

    if (fabricCanvas.value) {
      fabricCanvas.value.dispose();
      fabricCanvas.value = null;
    }

    fabricCanvas.value = new fabric.Canvas(canvasEl.value, {
      isDrawingMode: true,
      width: 600,
      height: 500,
      backgroundColor: "#fff"
    });

    fabricCanvas.value.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas.value);

    fabricCanvas.value.freeDrawingBrush.width = 2;
    fabricCanvas.value.freeDrawingBrush.color = "#222";

    if (templateUrl) await loadTemplate(templateUrl);
  };

  const loadTemplate = async (url: string) => {
    const fabric = await import("fabric");

    const { objects, options } = await fabric.loadSVGFromURL(url);

    const validObjects = objects.filter((o): o is NonNullable<typeof o> => o !== null);

    const group = fabric.util.groupSVGElements(validObjects, options);

    group.set({ selectable: false, evented: false });
    fabricCanvas.value.add(group);

    fabricCanvas.value.centerObject(group);

    fabricCanvas.value.sendToBack(group);
    fabricCanvas.value.renderAll();
  };

  const setMode = (mode: "draw" | "select" | "erase") => {
    if (!fabricCanvas.value) return;

    const brush = fabricCanvas.value.freeDrawingBrush;
    const canvasEl = fabricCanvas.value.upperCanvasEl;

    fabricCanvas.value.isDrawingMode = mode !== "select";

    if (mode === "erase") {
      brush.width = 16;
      brush.color = "#fff";
      canvasEl.style.cursor = eraserCursor;
    } else if (mode === "draw") {
      brush.width = 2;
      brush.color = "#222";
      brush.globalCompositeOperation = "source-over";
      canvasEl.style.cursor = pencilCursor;
    } else {
      canvasEl.style.cursor = "default";
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

  onUnmounted(() => fabricCanvas.value?.dispose());

  return { init, loadTemplate, setMode, undo, clear, exportPNG };
}
