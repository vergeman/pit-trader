import { Figure } from "react-bootstrap";
export default function InstructionFigure({ src, caption, width, className}) {

  return (
    <Figure>
      <Figure.Image
        alt={caption}
        src={src}
        width={width}
        className={className}
      />
      <Figure.Caption className="text-center">
        {caption}
      </Figure.Caption>
    </Figure>
  );
}