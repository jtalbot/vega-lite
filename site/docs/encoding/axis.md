---
layout: docs
menu: docs
title: Axis
permalink: /docs/axis.html
---

Axes provide axis lines, ticks and labels to convey how a spatial range represents a data range. Simply put, axes visualize scales.

By default, Vega-Lite automatically creates axes with default properties for `x` and `y` channels when they encode data fields.
User can set the `axis` property of x- or y-[field definition](encoding.html#field) to an object to customize [axis properties](#axis-properties) or set `axis` to `null` to remove the axis.

Besides `axis` property of a field definition, the configuration object ([`config`](config.html)) also provides [axis config](#axis-config) (`config: {axis: {...}}`) for setting default axis properties for all axes.


## Documentation Overview
{:.no_toc}

* TOC
{:toc}


<!--TODO: add default behavior for each property -->

## Axis Properties


{: .suppress-error}
```json
// Single View Specification
{
  "data": ... ,
  "mark": ... ,
  "encoding": {
    "x": {
      "field": ...,
      "type": ...,
      "axis": {                // Axis
        ...
      },
      ...
    },
    "y": ...,
    ...
  }
}
```

To customize axis, an `axis` object in [an encoding channel's definition](encoding.html) can contain the following groups of properties:

### General

{% include table.html props="domain,grid,maxExtent,minExtent,orient,offset,position,zindex" source="Axis" %}

### Labels

{% include table.html props="format,labels,labelAngle,labelOverlap,labelPadding" source= "Axis" %}

### Ticks

{% include table.html props="ticks,tickCount,tickSize,values" source="Axis" %}

### Title

{% include table.html props="title,titleAlign,titleAngle,titleMaxLength,titlePadding" source="Axis" %}

<!--
### Custom Axis Encodings

**TODO** (We have `encoding` property akin to [Vega's axis `encode`](https://vega.github.io/vega/docs/axes/#custom-axis-encodings), but within each element's block, we do not have `enter/update/exit`.)
-->

{:#axis-config}
## Axis Config


{: .suppress-error}
```json
// Top-level View Specification
{
  ...
  "config": {
    "axis": : {
      ...
    }
  }
}
```

To provide themes for all axes, the axis config `config: {axis: {...}}` can contain the following properties:

### General

{% include table.html props="bandPosition,domain,domainColor,domainWidth,maxExtent,minExtent" source="AxisConfig" %}

### Grid

{% include table.html props="grid,gridColor,gridDash,gridOpacity,gridWidth" source="AxisConfig" %}

### Labels

{% include table.html props="labels,labelAngle,labelColor,labelFont,labelFontSize,labelLimit,labelOverlap,labelPadding,shortTimeLabels" source="AxisConfig" %}

### Ticks

{% include table.html props="ticks,tickColor,tickRound,tickSize,tickWidth" source="AxisConfig" %}

### Title

{% include table.html props="titleAlign,titleAngle,titleBaseline,titleColor,titleFont,titleFontWeight,titleFontSize,titleLimit,titleMaxLength,titlePadding,titleX,titleY" source="AxisConfig" %}

