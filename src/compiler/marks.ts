import {Model} from './Model';
import {X, Y, COLOR, TEXT, SIZE, SHAPE, DETAIL, ROW, COLUMN, LABEL} from '../channel';
import {AREA, LINE, TEXT as TEXTMARK} from '../mark';
import {imputeTransform, stackTransform} from './stack';
import {extend} from '../util';
import {area} from './marks-area';
import {bar} from './marks-bar';
import {line} from './marks-line';
import {point} from './marks-point';
import {text} from './marks-text';
import {tick} from './marks-tick';
import {applyColorAndOpacity, ColorMode} from './util';

const markCompiler = {
  area: area,
  bar: bar,
  line: line,
  point: point,
  text: text,
  tick: tick,
  circle: circle,
  square: square
};

export function compileMarks(model: Model): any[] {
  const mark = model.mark();
  const name = model.spec().name;
  const isFaceted = model.has(ROW) || model.has(COLUMN);
  const dataFrom = {data: model.dataTable()};
  const markConfig = model.config().mark;
  const sortBy = markConfig.sortBy;

  if (mark === LINE || mark === AREA) {
    const details = detailFields(model);

    // For line and area, we sort values based on dimension by default
    // For line, a special config "sortLineBy" is allowed
    let sortLineBy = mark === LINE ? markConfig.sortLineBy : undefined;
    if (!sortLineBy) {
      sortLineBy = '-' + model.field(markConfig.orient === 'horizontal' ? Y : X);
    }

    let pathMarks: any = extend(
      name ? { name: name + '-marks' } : {},
      {
        type: markCompiler[mark].markType(model),
        from: extend(
          // If has facet, `from.data` will be added in the cell group.
          // If has subfacet for line/area group, `from.data` will be added in the outer subfacet group below.
          // If has no subfacet, add from.data.
          isFaceted || details.length > 0 ? {} : dataFrom,

          // sort transform
          {transform: [{ type: 'sort', by: sortLineBy }]}
        ),
        properties: { update: markCompiler[mark].properties(model) }
      }
    );

    // FIXME is there a case where area requires impute without stacking?

    if (details.length > 0) { // have level of details - need to facet line into subgroups
      const facetTransform = { type: 'facet', groupby: details };
      const transform: any[] = [].concat(
        (sortBy ? [{type: 'sort', by: sortBy}] : []),
        mark === AREA && model.stack() ?
          // For stacked area, we need to impute missing tuples and stack values
          [imputeTransform(model), stackTransform(model), facetTransform] :
          [facetTransform]
        );

      return [{
        name: (name ? name + '-' : '') + mark + '-facet',
        type: 'group',
        from: extend(
          // If has facet, `from.data` will be added in the cell group.
          // Otherwise, add it here.
          isFaceted ? {} : dataFrom,
          {transform: transform}
        ),
        properties: {
          update: {
            width: { field: { group: 'width' } },
            height: { field: { group: 'height' } }
          }
        },
        marks: [pathMarks]
      }];
    } else {
      return [pathMarks];
    }
  } else { // other mark type
    let marks = []; // TODO: vgMarks
    if (mark === TEXTMARK && model.has(COLOR)) {
      // add background to 'text' marks if has color
      marks.push(extend(
        name ? { name: name + '-background' } : {},
        {type: 'rect'},
        // If has facet, `from.data` will be added in the cell group.
        // Otherwise, add it here.
        isFaceted ? {} : {from: dataFrom},
        // Properties
        {properties: { update: text.background(model) } }
      ));
    }

    marks.push(extend(
      name ? { name: name + '-marks' } : {},
      { type: markCompiler[mark].markType(model) },
      // Add `from` if needed
      (!isFaceted || model.stack() || sortBy) ? {
        from: extend(
          // If faceted, `from.data` will be added in the cell group.
          // Otherwise, add it here
          isFaceted ? {} : dataFrom,
          // Stacked Chart need additional transform
          model.stack() || sortBy ? { transform: [].concat(
              (model.stack() ? [stackTransform(model)] : []),
              sortBy ? [{type:'sort', by: sortBy}] : []
          )} : {}
        )
      } : {},
      // properties groups
      { properties: { update: markCompiler[mark].properties(model) } }
    ));

    if (model.has(LABEL)) {
      const labelProperties = markCompiler[mark].labels(model);

      // check if we have label method for current mark type.
      if (labelProperties !== undefined) { // If label is supported
        // add label group
        marks.push(extend(
          name ? { name: name + '-label' } : {},
          {type: 'text'},
          // If has facet, `from.data` will be added in the cell group.
          // Otherwise, add it here.
          isFaceted ? {} : {from: dataFrom},
          // Properties
          { properties: { update: labelProperties } }
        ));
      }
    }

    return marks;
  }
}




/**
 * Returns list of detail fields (for 'color', 'shape', or 'detail' channels)
 * that the model's spec contains.
 */
function detailFields(model: Model): string[] {
  return [COLOR, DETAIL, SHAPE].reduce(function(details, channel) {
    if (model.has(channel) && !model.fieldDef(channel).aggregate) {
      details.push(model.field(channel));
    }
    return details;
  }, []);
}

function filled_point_props(shape) {
  return function(model: Model) {
    // TODO Use Vega's marks properties interface
    var p: any = {};

    // x
    if (model.has(X)) {
      p.x = {
        scale: model.scale(X),
        field: model.field(X, { binSuffix: '_mid' })
      };
    } else {
      p.x = { value: model.fieldDef(X).scale.bandWidth / 2 };
    }

    // y
    if (model.has(Y)) {
      p.y = {
        scale: model.scale(Y),
        field: model.field(Y, { binSuffix: '_mid' })
      };
    } else {
      p.y = { value: model.fieldDef(Y).scale.bandWidth / 2 };
    }

    // size
    if (model.has(SIZE)) {
      p.size = {
        scale: model.scale(SIZE),
        field: model.field(SIZE)
      };
    } else {
      p.size = { value: model.sizeValue() };
    }

    // shape
    p.shape = { value: shape };

    applyColorAndOpacity(p, model, ColorMode.ALWAYS_FILLED);
    return p;
  };
}

export namespace circle {
  export function markType(model: Model) {
    return 'symbol';
  }

  export const properties = filled_point_props('circle');

  export function labels(model: Model) {
    // TODO(#240): fill this method
    return undefined;
  }
}

export namespace square {
  export function markType(model: Model) {
    return 'symbol';
  }

  export const properties = filled_point_props('square');

  export function labels(model: Model) {
    // TODO(#240): fill this method
    return undefined;
  }
}
