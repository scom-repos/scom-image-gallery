const splitValue = (value: string|number): { value: number, unit: string } => {
  let num = value;
  let unit = '';

  if (isNaN(Number(value)) && typeof value === 'string') {
    const matches = /(\d+)(\D+)/g.exec(value);
    if (matches) {
      const [, height, _unit] = matches;
      num = height;
      unit = _unit;
    }
  }

  return { value: Number(num), unit };
}

export {
  splitValue
}