import { useEffect, useRef } from "react";
import { useEditorState } from "../context";
import { ElementUtils } from "../elements";

const CanvasTextEditor = (props: { x: number; y: number; id: string }) => {
  const textEditorInputRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    editorState,
    updateEditorState,
    updateElement,
    getActiveElement,
    removeElement,
  } = useEditorState();

  const createText = () => {
    const textarea = textEditorInputRef.current;

    if (!textarea || textarea.value === "") {
      // remove the text element if it contains no text
      removeElement(props.id);

      updateEditorState(
        {
          activeElementId: null,
          isEditingText: false,
        },
        true
      );
      return;
    }

    const activeElement = getActiveElement();

    if (
      editorState.isEditingText &&
      activeElement &&
      textEditorInputRef.current
    ) {
      const style = getComputedStyle(textEditorInputRef.current);
      const width = parseInt(style.width.split("px")[0]);
      let height = parseInt(style.height.split("px")[0]);

      updateElement({
        id: activeElement.id,
        width,
        height,
        text: textEditorInputRef.current.value || "",
      });

      updateEditorState(
        {
          activeElementId: null,
          isEditingText: false,
        },
        true
      );

      ElementUtils.drawElements(editorState.elements, editorState.elementIds);
    }
  };

  const onBlur = () => {
    createText();
  };

  useEffect(() => {
    const textarea = textEditorInputRef.current;

    if (!textarea) return;

    setTimeout(() => {
      textarea.focus();
    }, 0);

    // resize the textarea approriately when the text exceeds the current border
    const cb = () => {
      const computedStyleTextarea = getComputedStyle(textarea);

      const textareaWidthWithPadding = textarea.clientWidth;
      const textareaHeightWithPadding = textarea.clientHeight;

      const textareaWidthOnly =
        textareaWidthWithPadding -
        (parseFloat(computedStyleTextarea.paddingLeft) +
          parseFloat(computedStyleTextarea.paddingRight));
      const textareaHeightOnly =
        textareaHeightWithPadding -
        (parseFloat(computedStyleTextarea.paddingTop) +
          parseFloat(computedStyleTextarea.paddingBottom));

      // grow the textarea if the text exceeds the border -- https://stackoverflow.com/a/36958094
      const offsetHeight = textarea.clientHeight - textareaHeightOnly;

      if (textarea.scrollHeight > textarea.clientHeight) {
        textarea.style.height = `${textarea.scrollHeight - offsetHeight}px`;
      } else {
        textarea.style.height = `1px`;
        textarea.style.height = `${textarea.scrollHeight - offsetHeight}px`;
      }

      const offsetWidth = textarea.clientWidth - textareaWidthOnly;

      if (textarea.scrollWidth > textarea.clientWidth) {
        textarea.style.width = `${textarea.scrollWidth - offsetWidth}px`;
      } else {
        textarea.style.width = `1px`;
        textarea.style.width = `${textarea.scrollWidth - offsetWidth}px`;
      }
    };

    const keydownCb = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        createText();
      }
    };

    textarea.addEventListener("input", cb);
    window.addEventListener("keydown", keydownCb);

    return () => {
      textarea.removeEventListener("input", cb);
      window.removeEventListener("keydown", keydownCb);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <textarea
      dir="auto"
      tabIndex={0}
      wrap="off"
      className="text-editor-input"
      ref={textEditorInputRef}
      style={{
        top: `${props.y - 13}px`,
        left: `${props.x}px`,
      }}
      onBlur={onBlur}
    ></textarea>
  );
};

export default CanvasTextEditor;
