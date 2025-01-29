import { useState } from "react";
import PropTypes from "prop-types";

const TextRenderer = ({
  item,
  handleSelect,
  updateItem,
  handleMouseOver,
  handleMouseOut,
  commonStyle,
  drag,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleInputSave(e);
    }
  };

  const handleInputSave = (e) => {
    const newValue = e.currentTarget.value;
    updateItem({ ...item, value: newValue });
    setIsEditing(false);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };
  const handleBlur = (e) => {
    if (isEditing) {
      handleInputSave(e);
    }
  };

  return isEditing ? (
    <input
      id={item.id}
      type="text"
      defaultValue={item.value}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      autoFocus
      onBlur={handleBlur}
      onKeyDown={handleInputKeyDown}
    />
  ) : (
    <span
      id={item.id}
      style={commonStyle}
      onClick={handleSelect}
      onDoubleClick={handleDoubleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      ref={(node) => drag(node)}
    >
      {item.value || "Empty Text"}
    </span>
  );
};

TextRenderer.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.string,
  }).isRequired,
  handleSelect: PropTypes.func.isRequired,
  updateItem: PropTypes.func.isRequired,
  handleMouseOver: PropTypes.func.isRequired,
  handleMouseOut: PropTypes.func.isRequired,
  commonStyle: PropTypes.object.isRequired,
  drag: PropTypes.func.isRequired,
};

export default TextRenderer;
