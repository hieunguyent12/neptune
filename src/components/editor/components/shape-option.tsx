import { SHAPE } from "../types";

export default function ShapeOption({
  shape,
  onSelectShape,
}: {
  shape: SHAPE;
  onSelectShape: (shape: SHAPE) => void;
}) {
  return (
    <button
      onClick={() => onSelectShape(shape)}
      style={{
        margin: "0 15px",
      }}
    >
      {shape}
    </button>
  );
}
