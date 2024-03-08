function Inner(testo: string) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = testo;
    const textContent = tempDiv.innerText;

    return textContent;

  }

export default Inner ;