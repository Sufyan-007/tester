import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import DropZone from "../DropZone";
import Renderer from "../Renderer";
import { useSelection } from "../contexts/SelectionContext";
import { getValue } from "../constants/processAttributesFunction";

const HTMLRendererX = ({
  item,
  handleSelect,
  handleMouseOver,
  handleMouseOut,
  commonStyle,
  heirarchy,
  addChild,
  updateChild,
  drag,
}) => {
  const { localStyles, selectedItemId } = useSelection();

  useEffect(() => {
    console.log("HTMLRenderer re-rendered");
  }, [heirarchy]);

  // Stabilizing the heirarchy to avoid unnecessary re-renders
  const stableHeirarchy = useMemo(
    () => [...heirarchy, item.id],
    [item.id, heirarchy]
  );
  
  const processedAttributes = useMemo(() => {
    if (!item.attributes) return {};
  
    return Object.entries(item.attributes).reduce((acc, [key, value]) => {
      if (key === "style" && value?.type === "OBJECT") {
        acc[key] = Object.entries(value.properties).reduce((styleAcc, [styleKey, styleValue]) => {
          console.log(item.attributes);
          styleAcc[styleKey] = getValue(styleValue?.value ?? styleValue);
          return styleAcc;
        }, {});
      } else {
        acc[key] = getValue(value);
      }
      return acc;
    }, {});
  }, [item.attributes]);
  
  const appliedStyles = useMemo(() => {
    if (localStyles && selectedItemId === item.id && Object.keys(localStyles).length > 0) {
      return { ...commonStyle, ...processedAttributes.style, ...localStyles };
    }
    return { ...commonStyle, ...processedAttributes.style };
  }, [localStyles, selectedItemId, processedAttributes, commonStyle, item.id]);

  const renderedChildren = useMemo(() => {
    return Array.isArray(item.children)
      ? [
          ...item.children.map((child, index) => {
            const prevId = index > 0 ? item.children[index - 1].id : null;
            return (
              <Renderer
                key={child?.id || `${item.id}-${index}`}
                item={child}
                prevId={prevId}
                updateItem={(updatedChild) => updateChild(updatedChild, index)}
                addSibling={(newChild, offset) =>
                  addChild(newChild, offset, index)
                }
                heirarchy={[...stableHeirarchy, child.id]}
                isFirst={false}
              />
            );
          }),
          item.children.length === 0 ? (
            <DropZone
              key={`${item.id}-drop`}
              onDrop={(addedItem) =>
                addChild(addedItem, 0, item.children.length)
              }
              position="bottom"
              isOnly={true}
              heirarchy={[...stableHeirarchy, item.id]}
            >
              DROP HERE
            </DropZone>
          ) : (
            <DropZone
              key={`${item.id}-drop-bottom`}
              onDrop={(addedItem) =>
                addChild(addedItem, 0, item.children.length)
              }
              position="bottom"
              heirarchy={[
                ...stableHeirarchy,
                item.id,
                item.children[item.children.length - 1].id,
              ]}
            />
          ),
        ]
      : [];
  }, [item, stableHeirarchy, addChild, updateChild]);

  return React.createElement(
    item.tagName || "div",
    {
      ...processedAttributes,
      style: appliedStyles, // Ensures local styles take priority
      onClick: handleSelect,
      onMouseOver: handleMouseOver,
      onMouseOut: handleMouseOut,
      id: item.id,
      ref: (node) => drag(node),
    },
    ...renderedChildren
  );
};

const HTMLRenderer = React.memo(HTMLRendererX, (prevProps, nextProps) => {
  // Custom comparison function to prevent re-renders unless necessary
  return (
    prevProps.item === nextProps.item &&
    prevProps.localStyles === nextProps.localStyles &&
    JSON.stringify(prevProps.heirarchy) === JSON.stringify(nextProps.heirarchy) &&
    prevProps.handleMouseOver === nextProps.handleMouseOver &&
    prevProps.handleMouseOut === nextProps.handleMouseOut &&
    prevProps.handleSelect === nextProps.handleSelect &&
    prevProps.commonStyle === nextProps.commonStyle &&
    prevProps.drag === nextProps.drag &&
    prevProps.addChild === nextProps.addChild &&
    prevProps.updateChild === nextProps.updateChild
  );
});

HTMLRendererX.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    tagName: PropTypes.string,
    attributes: PropTypes.object,
    children: PropTypes.array,
  }).isRequired,
  handleSelect: PropTypes.func.isRequired,
  handleMouseOver: PropTypes.func.isRequired,
  handleMouseOut: PropTypes.func.isRequired,
  commonStyle: PropTypes.object.isRequired,
  heirarchy: PropTypes.array.isRequired,
  addChild: PropTypes.func.isRequired,
  updateChild: PropTypes.func.isRequired,
  drag: PropTypes.func.isRequired,
};

export default HTMLRenderer;
