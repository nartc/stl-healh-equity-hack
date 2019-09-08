const formatTime = time => {
    const lastTwo = time.substr(-2);
    const timeVal = time.split(lastTwo)[0];
    const isAm = lastTwo === 'AM';
  
    const [hour, minute] = timeVal.split(':');
  
    return !!minute
      ? isAm
        ? `${hour}:${minute}`
        : `${Number(hour) + 12}:${minute}`
      : isAm
      ? `${hour}:00`
      : `${Number(hour) + 12}:00`;
  };
  
  const getHour = hour => {
    if (hour === 'Closed') {
      return '00:00-00:00';
    }
  
    if (hour === 'Open 24 hours') {
      return '00:00-24:00';
    }
  
    const [open, close] = hour.split('–');
    return `${formatTime(open)}-${formatTime(close)}`;
  };

module.exports = {getHour};
