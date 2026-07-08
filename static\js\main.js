document.addEventListener('DOMContentLoaded', function() {
    var searchBtn = document.getElementById('searchBtn');
    var valveModelInput = document.getElementById('valveModel');
    var customerNameInput = document.getElementById('customerName');
    var batchSearchBtn = document.getElementById('batchSearchBtn');
    var batchInput = document.getElementById('batchInput');
    var uploadBtn = document.getElementById('uploadBtn');
    var excelFile = document.getElementById('excelFile');
    var noResult = document.getElementById('noResult');
    var resultList = document.getElementById('resultList');
    var loadingOverlay = document.getElementById('loadingOverlay');
    var lineNumbers = document.getElementById('lineNumbers');
    var dropZone = document.getElementById('dropZone');
    var fileName = document.getElementById('fileName');

    searchBtn.addEventListener('click', doSearch);
    batchSearchBtn.addEventListener('click', doBatchSearch);
    uploadBtn.addEventListener('click', doUploadExcel);

    valveModelInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') doSearch();
    });

    customerNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') doSearch();
    });

    // ====== Line Numbers ======
    batchInput.addEventListener('input', updateLineNumbers);
    batchInput.addEventListener('scroll', function() {
        lineNumbers.scrollTop = batchInput.scrollTop;
    });

    function updateLineNumbers() {
        var lines = batchInput.value.split('\n');
        var count = Math.max(lines.length, 6);
        var html = '';
        for (var i = 1; i <= count; i++) {
            html += i + '\n';
        }
        lineNumbers.textContent = html;
    }
    updateLineNumbers();

    // ====== Drag & Drop ======
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
        var files = e.dataTransfer.files;
        if (files.length > 0) {
            var file = files[0];
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                excelFile.files = files;
                showFileName(file.name);
            } else {
                alert('请上传Excel文件(.xlsx或.xls)');
            }
        }
    });

    excelFile.addEventListener('change', function() {
        if (excelFile.files.length > 0) {
            showFileName(excelFile.files[0].name);
        }
    });

    function showFileName(name) {
        fileName.textContent = name;
        fileName.classList.add('show');
    }

    // ====== Loading ======
    function showLoading(text) {
        loadingOverlay.querySelector('p').textContent = text || '查询中...';
        loadingOverlay.classList.add('active');
    }

    function hideLoading() {
        loadingOverlay.classList.remove('active');
    }

    // ====== Single Search ======
    function doSearch() {
        var valveModel = valveModelInput.value.trim();
        var customerName = customerNameInput.value.trim();

        if (!valveModel && !customerName) {
            alert('请输入阀体型号或客户名称');
            return;
        }

        showLoading('正在查询...');
        searchBtn.disabled = true;

        fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                valve_model: valveModel,
                customer_name: customerName
            })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            hideLoading();
            searchBtn.disabled = false;

            if (data.success && data.data.length > 0) {
                noResult.style.display = 'none';
                resultList.style.display = 'flex';
                renderResults(data.data);
            } else {
                noResult.style.display = 'block';
                resultList.style.display = 'none';
            }
        })
        .catch(function(err) {
            hideLoading();
            searchBtn.disabled = false;
            alert('查询出错: ' + err.message);
        });
    }

    // ====== Batch Search ======
    function doBatchSearch() {
        var inputText = batchInput.value.trim();
        if (!inputText) {
            alert('请输入查询内容');
            return;
        }

        var lines = inputText.split('\n').filter(function(l) { return l.trim(); });
        var items = [];

        for (var i = 0; i < lines.length; i++) {
            var parts = lines[i].split(',').map(function(s) { return s.trim(); });
            if (parts.length >= 2) {
                items.push({ customer_name: parts[0], valve_model: parts[1] });
            } else if (parts.length === 1 && parts[0]) {
                items.push({ customer_name: parts[0], valve_model: '' });
            }
        }

        if (items.length === 0) {
            alert('请输入有效内容，格式：客户名称,阀体型号');
            return;
        }

        showLoading('正在批量查询...');
        batchSearchBtn.disabled = true;

        fetch('/api/batch_search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: items })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            hideLoading();
            batchSearchBtn.disabled = false;

            if (data.success) {
                noResult.style.display = 'none';
                resultList.style.display = 'flex';
                renderBatchResults(data);
            } else {
                alert(data.message);
            }
        })
        .catch(function(err) {
            hideLoading();
            batchSearchBtn.disabled = false;
            alert('查询出错: ' + err.message);
        });
    }

    // ====== Excel Upload ======
    function doUploadExcel() {
        var file = excelFile.files[0];
        if (!file) {
            alert('请选择Excel文件');
            return;
        }

        var formData = new FormData();
        formData.append('file', file);

        showLoading('正在导入并查询...');
        uploadBtn.disabled = true;

        fetch('/api/upload_excel', {
            method: 'POST',
            body: formData
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            hideLoading();
            uploadBtn.disabled = false;

            if (data.success) {
                noResult.style.display = 'none';
                resultList.style.display = 'flex';
                renderBatchResults(data);
            } else {
                alert(data.message);
            }
        })
        .catch(function(err) {
            hideLoading();
            uploadBtn.disabled = false;
            alert('上传出错: ' + err.message);
        });
    }

    // ====== Render Single Results ======
    function renderResults(specs) {
        resultList.innerHTML = '';

        specs.forEach(function(spec) {
            var card = document.createElement('div');
            card.className = 'spec-card';

            var entriesHtml = '';
            if (spec.entries && spec.entries.length > 0) {
                entriesHtml = '<div class="spec-models"><h3>序号-客户名称-阀体型号 对应关系</h3>' +
                    '<table class="model-table"><thead><tr><th>序号</th><th>客户名称</th><th>阀体型</th><th>特殊包装说明</th><th>备注</th></tr></thead><tbody>';
                spec.entries.forEach(function(e) {
                    entriesHtml += '<tr><td>' + e.seq_number + '</td><td>' + e.customer_name + '</td><td>' + e.valve_model + '</td><td>' + (e.special_note || '-') + '</td><td>' + (e.remark || '-') + '</td></tr>';
                });
                entriesHtml += '</tbody></table></div>';
            }

            var imagesHtml = '';
            if (spec.images && spec.images.length > 0) {
                imagesHtml = '<div class="spec-images"><h3>包装仕样书图片</h3><div class="image-grid">';
                spec.images.forEach(function(img) {
                    imagesHtml += '<div class="image-item"><img src="/' + img.image_path + '" alt="包装仕样书" onclick="openLightbox(this.src)" /><div class="image-caption">第 ' + img.page_number + ' 页</div></div>';
                });
                imagesHtml += '</div></div>';
            }

            card.innerHTML = '<div class="spec-header"><h2>' + spec.spec_number + '</h2><div class="spec-meta"><span>产品型号: ' + spec.product_model + '</span><span>' + spec.description + '</span></div></div>' +
                '<div class="spec-body">' + entriesHtml + imagesHtml + '</div>';
            resultList.appendChild(card);
        });
    }

    // ====== Render Batch Results ======
    function renderBatchResults(data) {
        resultList.innerHTML = '';

        // Summary card
        var summaryCard = document.createElement('div');
        summaryCard.className = 'spec-card';
        summaryCard.innerHTML = '<div class="spec-header" style="background: linear-gradient(135deg, #52c41a, #389e0d);">' +
            '<h2>批量查询结果</h2>' +
            '<div class="spec-meta"><span>总计: ' + data.total + ' 条</span><span>已匹配: ' + data.found_count + ' 条</span><span style="background: rgba(255,77,79,0.3);">未匹配: ' + data.not_found_count + ' 条</span></div></div>';
        resultList.appendChild(summaryCard);

        // Found items
        if (data.found.length > 0) {
            var foundCard = document.createElement('div');
            foundCard.className = 'spec-card';

            var tableHtml = '<div class="spec-header" style="background: linear-gradient(135deg, #52c41a, #389e0d);"><h2>已匹配的包装仕样书</h2></div>' +
                '<div class="spec-body"><table class="model-table"><thead><tr><th>客户名称</th><th>阀体型号</th><th>仕样书编号</th><th>产品型号</th><th>说明</th><th>图片</th></tr></thead><tbody>';

            data.found.forEach(function(f, idx) {
                var hasImages = f.images && f.images.length > 0;
                var imgCount = hasImages ? f.images.length : 0;
                var expandLabel = hasImages ? (imgCount + '张图片') : '无';

                // Main row
                tableHtml += '<tr data-idx="' + idx + '">';
                tableHtml += '<td>' + f.customer_name + '</td>';
                tableHtml += '<td>' + f.valve_model + '</td>';
                tableHtml += '<td>' + f.spec_number + '</td>';
                tableHtml += '<td>' + f.product_model + '</td>';
                tableHtml += '<td>' + f.description + '</td>';
                tableHtml += '<td>';
                if (hasImages) {
                    tableHtml += '<button class="expand-btn" onclick="toggleExpand(this, ' + idx + ')"><span class="arrow">▶</span> ' + expandLabel + '</button>';
                } else {
                    tableHtml += '<span style="color:#999;">无</span>';
                }
                tableHtml += '</td></tr>';

                // Expand row
                if (hasImages) {
                    tableHtml += '<tr class="expand-row" id="expand-' + idx + '"><td colspan="6"><div class="expand-content"><div class="expand-images">';
                    f.images.forEach(function(img, imgIdx) {
                        var allPaths = f.images.map(function(p) { return '/' + p; });
                        var pathsJson = JSON.stringify(allPaths).replace(/"/g, '&quot;');
                        tableHtml += '<div class="expand-img-item"><img src="/' + img + '" onclick="openLightboxMulti(' + pathsJson + ',' + imgIdx + ')" title="点击放大" /><div class="expand-img-caption">第' + (imgIdx + 1) + '页</div></div>';
                    });
                    tableHtml += '</div></div></td></tr>';
                }
            });

            tableHtml += '</tbody></table></div>';
            foundCard.innerHTML = tableHtml;
            resultList.appendChild(foundCard);
        }

        // Not found items
        if (data.not_found.length > 0) {
            var notFoundCard = document.createElement('div');
            notFoundCard.className = 'spec-card';
            var nfHtml = '<div class="spec-header" style="background: linear-gradient(135deg, #ff4d4f, #cf1322);"><h2>未匹配的包装仕样书</h2></div>' +
                '<div class="spec-body"><table class="model-table"><thead><tr><th>客户名称</th><th>阀体型号</th><th>原因</th></tr></thead><tbody>';
            data.not_found.forEach(function(n) {
                nfHtml += '<tr style="background: #fff2f0;"><td>' + n.customer_name + '</td><td>' + n.valve_model + '</td><td style="color: #ff4d4f; font-weight: 600;">' + n.reason + '</td></tr>';
            });
            nfHtml += '</tbody></table></div>';
            notFoundCard.innerHTML = nfHtml;
            resultList.appendChild(notFoundCard);
        }
    }
});

// ====== Tab Switch ======
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(function(btn) { btn.classList.remove('active'); });
    document.querySelectorAll('.tab-content').forEach(function(content) { content.classList.remove('active'); });

    if (tab === 'single') {
        document.querySelector('.tab-btn:first-child').classList.add('active');
        document.getElementById('singleTab').classList.add('active');
    } else {
        document.querySelector('.tab-btn:last-child').classList.add('active');
        document.getElementById('batchTab').classList.add('active');
    }
}

// ====== Expand/Collapse Row ======
function toggleExpand(btn, idx) {
    var row = document.getElementById('expand-' + idx);
    if (!row) return;

    var isOpen = row.classList.contains('active');

    // Close all other expand rows
    document.querySelectorAll('.expand-row.active').forEach(function(r) {
        r.classList.remove('active');
    });
    document.querySelectorAll('.expand-btn.expanded').forEach(function(b) {
        b.classList.remove('expanded');
    });

    if (!isOpen) {
        row.classList.add('active');
        btn.classList.add('expanded');
    }
}

// ====== Lightbox ======
function openLightbox(src) {
    openLightboxMulti([src], 0);
}

function openLightboxMulti(srcs, startIndex) {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox';
        document.body.appendChild(lightbox);
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) closeLightbox();
        });
    }
    window._lightboxSrcs = srcs;
    window._lightboxIdx = startIndex;
    renderLightbox();
    lightbox.classList.add('active');
}

function renderLightbox() {
    var lightbox = document.getElementById('lightbox');
    var srcs = window._lightboxSrcs;
    var idx = window._lightboxIdx;
    var total = srcs.length;
    var html = '<span class="lightbox-close" onclick="closeLightbox()">×</span>';
    if (total > 1) {
        html += '<span class="lightbox-prev" onclick="lightboxPrev()">❮</span>';
    }
    html += '<img src="' + srcs[idx] + '" alt="放大查看" />';
    if (total > 1) {
        html += '<span class="lightbox-next" onclick="lightboxNext()">❯</span>';
        html += '<div class="lightbox-counter">' + (idx + 1) + ' / ' + total + '</div>';
    }
    lightbox.innerHTML = html;
}

function lightboxPrev() {
    var srcs = window._lightboxSrcs;
    window._lightboxIdx = (window._lightboxIdx - 1 + srcs.length) % srcs.length;
    renderLightbox();
}

function lightboxNext() {
    var srcs = window._lightboxSrcs;
    window._lightboxIdx = (window._lightboxIdx + 1) % srcs.length;
    renderLightbox();
}

function closeLightbox() {
    var lightbox = document.getElementById('lightbox');
    if (lightbox) lightbox.classList.remove('active');
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev();
    if (e.key === 'ArrowRight') lightboxNext();
});
