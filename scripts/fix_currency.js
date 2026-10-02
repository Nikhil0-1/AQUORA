const fs = require('fs');
const { resolve } = require('path');
const { readdir } = require('fs').promises;

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

(async () => {
  const files = await getFiles('./apps');
  for (const file of files) {
    if (!file.match(/\.tsx?$/)) continue;
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    // The previous powershell script messed up `$` because of encoding, turning it into `?`.
    // It replaced `${` with `?{`. We revert `?{` to `${` for templates.
    if (content.includes('?{')) {
      content = content.replace(/\?\{/g, '${');
      changed = true;
    }
    
    // For string templates that actually display currency, like >${product.price}< we want >₹{product.price}<
    // Wait, reverting `?{` to `${` fixes template literals. Now we just need to replace `>` `$` `{` with `>` `₹` `{`.
    if (content.includes('>${')) {
      content = content.replace(/>\$\{/g, '>₹{');
      changed = true;
    }

    if (content.includes('?0.00')) {
      content = content.replace(/\?0\.00/g, '₹0.00');
      changed = true;
    }

    // Also look for literal `$ ` or `$` used as text
    if (content.includes('Pay $')) {
      content = content.replace(/Pay \$/g, 'Pay ₹');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
    }
  }
  console.log("Done fixing currency");
})();
