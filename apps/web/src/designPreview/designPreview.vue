<template>
  <div class="designPreviewRoot referenceDirection" :class="['variant' + variant, { showingLibrary: screen === 'library', showingHome: screen === 'home', inspectorShown: inspectorOpen && !!selectedNode, composerShown: composerOpen }]" data-map-id="AC.UI02.PREVIEW.ROOT" @keydown.esc="dismissOverlays">
    <header class="previewTopbar" data-map-id="AC.UI02.PREVIEW.HEADER">
      <button type="button" class="previewBrand" aria-label="Mở giao diện Tổng" title="Về Tổng" data-map-id="AC.UI02.PREVIEW.HOME" @click="openHome">
        <span class="previewBrandSymbol" aria-hidden="true"><StudioIcon name="spark" /></span>
        <span class="previewBrandText">FRAME<span>SPACE</span></span>
      </button>
      <span class="previewTopDivider" aria-hidden="true"></span>
      <div class="previewBreadcrumb" :title="screen === 'home' ? 'Tổng' : screen === 'library' ? 'Thư viện dự án' : activeProjectName"><span>Creative Studio</span><span aria-hidden="true">/</span><strong>{{ screen === 'home' ? 'Tổng' : screen === 'library' ? 'Dự án' : activeProjectName }}</strong></div>
      <div class="previewTopSpacer"></div>
      <div class="previewHeaderActions">
        <button type="button" class="previewTopAction previewHomeNav" title="Trở về Tổng" aria-label="Mở trang Tổng" :aria-pressed="screen === 'home'" data-map-id="AC.UI02.PREVIEW.NAV.HOME" @click="openHome"><StudioIcon name="projects" /><span>Tổng</span></button>
        <div class="variantSwitch" role="group" aria-label="Chọn phương án thiết kế">
          <button type="button" title="Phương án A — LibTV Canvas" aria-label="Chọn giao diện A — LibTV Canvas" :aria-pressed="variant === 'A'" data-map-id="AC.UI02.PREVIEW.MODE.A" @click="selectVariant('A')">A <span>LibTV Canvas</span></button>
          <button type="button" title="Phương án B — Cinematic Pro Studio" aria-label="Chọn giao diện B — Cinematic Pro Studio" :aria-pressed="variant === 'B'" data-map-id="AC.UI02.PREVIEW.MODE.B" @click="selectVariant('B')">B <span>Cinematic Pro</span></button>
        </div>
        <span class="previewHeaderDemo" data-map-id="AC.UI02.PREVIEW.DEMO.STATUS" title="Bản xem trước: dữ liệu chỉ trong bộ nhớ, không gửi AI hay ghi SQLite"><span aria-hidden="true" class="previewDemoDot"></span>DEMO</span>
        <button type="button" class="previewTopAction" data-map-id="AC.UI02.PREVIEW.PROJECTS" :title="screen === 'library' ? 'Quay về Canvas' : 'Mở thư viện dự án mẫu'" :aria-label="screen === 'library' ? 'Quay về Canvas' : 'Mở thư viện dự án mẫu'" :aria-pressed="screen === 'library'" @click="toggleProjectLibrary"><StudioIcon :name="screen === 'library' ? 'canvas' : 'projects'" /><span>{{ screen === 'library' ? 'Canvas' : 'Dự án' }}</span></button>
      </div>
    </header>

    <div class="previewReviewStrip" role="note">
      <span class="reviewMarker">BẢN XEM TRƯỚC</span>
      <span class="reviewDisclaimer">Dữ liệu chỉ trong bộ nhớ · Không kết nối AI / SQLite</span>
      <div class="previewReviewControls">
        <label v-if="screen === 'canvas'">Workflow
          <select v-model="scenario" aria-label="Chọn workflow xem trước" data-map-id="AC.UI02.PREVIEW.SCENARIO"><option value="three">3 node</option><option value="seven">7 node</option><option value="empty">Canvas trống</option></select>
        </label>
        <label v-if="screen === 'canvas'">Media
          <select v-model="mediaMode" aria-label="Chọn trạng thái media" data-map-id="AC.UI02.PREVIEW.MEDIA"><option value="demo">Có DEMO</option><option value="compact">Chưa có kết quả</option></select>
        </label>
        <label v-if="screen === 'canvas'">Trạng thái
          <select v-model="previewStatus" aria-label="Chọn trạng thái UI mẫu (không kết nối backend)" data-map-id="AC.UI02.PREVIEW.STATUS"><option value="normal">Bình thường</option><option value="empty">Empty</option><option value="loading">Loading</option><option value="saved">Saved</option><option value="unsaved">Unsaved</option><option value="offline">Offline</option><option value="save503">Error 503</option><option value="conflict409">Conflict 409</option></select>
        </label>
        <label v-if="screen === 'library'">Thư viện
          <select v-model="libraryMode" data-map-id="AC.UI02.PREVIEW.LIBRARY.MODE" aria-label="Thư viện có dự án hay trống"><option value="projects">Có dự án</option><option value="empty">Trống</option></select>
        </label>
      </div>
    </div>

    <section v-if="screen === 'home'" class="previewHome" data-map-id="AC.UI02.PREVIEW.HOME.SCREEN">
      <aside class="homeSidebar" aria-label="Điều hướng giao diện Tổng">
        <div class="homeSidebarBrand"><StudioIcon name="spark" /><strong>FRAMESPACE</strong></div>
        <span class="homeNavGroupLabel">KHÔNG GIAN LÀM VIỆC</span>
        <button type="button" class="homeSidebarItem active" aria-current="page" @click="openHome"><StudioIcon name="projects" />Tổng</button>
        <button type="button" class="homeSidebarItem" @click="openProjectLibrary"><StudioIcon name="layers" />Dự án</button>
        <button type="button" class="homeSidebarItem" @click="openCanvas"><StudioIcon name="canvas" />Canvas</button>
        <span class="homeNavGroupLabel">SÁNG TẠO</span>
        <button type="button" class="homeSidebarItem" @click="openCanvasAndAdd('image')"><StudioIcon name="image" />Tạo ảnh</button>
        <button type="button" class="homeSidebarItem" @click="openCanvasAndAdd('video')"><StudioIcon name="video" />Tạo video</button>
        <button type="button" class="homeSidebarItem" @click="openCanvasAndAdd('text')"><StudioIcon name="text" />Viết ý tưởng</button>
        <div class="homeSidebarBottom"><span class="previewDemoDot"></span>Chế độ xem trước · DEMO</div>
      </aside>
      <div class="homeMain">
        <div class="homeWelcome"><span class="previewEyebrow">KHÔNG GIAN SÁNG TẠO</span><h1>Từ ý tưởng đến khung hình.</h1><p>Tổ chức dự án, dựng Canvas và phát triển câu chuyện trong một không gian.</p></div>
        <button type="button" class="homeHero" data-map-id="AC.UI02.PREVIEW.HOME.CREATE" @click="startEmptyCanvas"><span class="homeHeroAdd"><StudioIcon name="plus" /></span><strong>Tạo một khung vẽ mới</strong><small>Canvas trống, sẵn sàng cho ý tưởng của bạn</small></button>
        <div class="homeShortcutGrid" role="group" aria-label="Các công cụ đang hoạt động">
          <button v-for="shortcut in homeShortcuts" :key="shortcut.label" type="button" class="homeShortcutButton" :title="shortcut.description" @click="runHomeShortcut(shortcut.action)"><span class="homeShortcutIcon"><StudioIcon :name="shortcut.icon" /></span><span>{{ shortcut.label }}</span></button>
        </div>
        <section class="homeSection"><div class="homeSectionHeading"><div><span class="previewEyebrow">DỰ ÁN GẦN ĐÂY</span><h2>Tiếp tục sáng tạo</h2></div><button type="button" @click="openProjectLibrary">Tất cả dự án <StudioIcon name="external" /></button></div>
          <div class="homeRecentGrid"><button v-for="project in previewProjects.filter(item => !item.deleted).slice(0, 4)" :key="project.id" type="button" class="homeRecentCard" @click="openPreviewProject(project.id)"><img :src="project.poster" :alt="'Ảnh minh họa DEMO cho ' + project.name" /><strong>{{ project.name }}</strong><small>{{ project.description }}</small></button></div>
        </section>
        <section class="homeSection"><div class="homeSectionHeading"><div><span class="previewEyebrow">KHÁM PHÁ CANVAS</span><h2>Khởi đầu từ một ý tưởng</h2></div><button type="button" @click="openCanvas">Mở Canvas <StudioIcon name="external" /></button></div>
          <div class="homeShowcaseGrid"><button type="button" class="homeShowcaseCard" @click="openCanvasWithScenario('three')"><img src="/designPreview/streetFrame.svg" alt="Khung hình phố đêm DEMO"/><strong>Câu chuyện thành phố</strong><small>Workflow 3 node · DEMO</small></button><button type="button" class="homeShowcaseCard" @click="openCanvasWithScenario('seven')"><img src="/designPreview/portraitFrame.svg" alt="Chân dung sáng tạo DEMO"/><strong>Storyboard điện ảnh</strong><small>Workflow 7 node · DEMO</small></button><button type="button" class="homeShowcaseCard" @click="openCanvasAndAdd('video')"><img src="/designPreview/flowerFrame.svg" alt="Minh họa clip CC0 DEMO"/><strong>Chuyển động tự nhiên</strong><small>Video minh họa CC0</small></button></div>
        </section>
        <p class="homeFooterNote">Bản xem trước giao diện · Tác vụ DEMO chỉ lưu trong bộ nhớ, không kết nối AI.</p>
      </div>
    </section>

    <section v-else-if="screen === 'library'" class="previewLibrary" data-map-id="AC.UI02.PREVIEW.LIBRARY">
      <header class="previewLibraryHeader">
        <div><span class="previewEyebrow">PROJECT LIBRARY · DEMO</span><h1>Dự án <span class="previewCount" data-map-id="AC.UI02.PREVIEW.LIBRARY.COUNT">{{ visibleProjects.length }}</span></h1><p>Chỉ quản lý bản xem trước trong bộ nhớ, không đồng bộ tài khoản.</p></div>
        <button type="button" class="previewPrimaryButton" data-map-id="AC.UI02.PREVIEW.PROJECT.NEW" @click="openProjectDialog('create')"><StudioIcon name="plus" /> Tạo dự án</button>
      </header>
      <div class="libraryUtilityRow">
        <label class="previewSearch"><StudioIcon name="search" /><input v-model="libraryQuery" data-map-id="AC.UI02.PREVIEW.PROJECT.SEARCH" type="search" aria-label="Tìm dự án DEMO" placeholder="Tìm dự án, cảnh quay..." /></label>
        <span class="previewLibrarySummary" data-map-id="AC.UI02.PREVIEW.LIBRARY.SUMMARY">{{ visibleProjects.length }} dự án · DEMO</span>
      </div>
      <div v-if="visibleProjects.length" class="previewProjectGrid">
        <article v-for="(project, index) in visibleProjects" :key="project.id" class="previewProjectCard">
          <button type="button" class="projectPreviewCover" data-map-id="AC.UI02.PREVIEW.PROJECT.OPEN" :data-preview-project-id="project.id" :aria-label="'Mở dự án mẫu ' + project.name" @click="openPreviewProject(project.id)">
            <img :src="project.poster" alt="Minh họa do dự án tạo riêng cho giao diện xem trước" />
            <span class="previewProjectBadge">ẢNH MINH HỌA · DEMO</span><span class="projectCoverIndex">{{ String(index + 1).padStart(2, '0') }} / FRAMESPACE</span>
          </button>
          <div class="projectPreviewInformation">
            <button type="button" class="projectPreviewTitle" data-map-id="AC.UI02.PREVIEW.PROJECT.OPEN" :data-preview-project-id="project.id" @click="openPreviewProject(project.id)"><strong>{{ project.name }}</strong><small>{{ project.description }}</small><span class="projectCardMeta">Bản xem trước · DEMO</span></button>
            <div class="projectCardMenu">
              <button type="button" class="projectMoreButton" data-map-id="AC.UI02.PREVIEW.PROJECT.MENU" :data-preview-project-id="project.id" :aria-haspopup="'menu'" :aria-expanded="openProjectMenuId === project.id" :aria-label="'Tùy chọn dự án ' + project.name" @click.stop="openProjectMenuId = openProjectMenuId === project.id ? '' : project.id"><StudioIcon name="more" /></button>
              <div v-if="openProjectMenuId === project.id" class="projectMoreMenu" role="menu" :aria-label="'Thao tác dự án ' + project.name" @keydown.esc.stop="openProjectMenuId = ''">
                <button type="button" role="menuitem" data-map-id="AC.UI02.PREVIEW.PROJECT.MENU.OPEN" @click="openPreviewProject(project.id)"><StudioIcon name="canvas" />Mở dự án</button>
                <button type="button" role="menuitem" data-map-id="AC.UI02.PREVIEW.PROJECT.RENAME" @click="openProjectDialog('rename', project.id)"><StudioIcon name="text" />Đổi tên</button>
                <button type="button" role="menuitem" data-map-id="AC.UI02.PREVIEW.PROJECT.DELETE" @click="requestDelete('project', project.id)"><StudioIcon name="trash" />Xóa mềm</button>
              </div>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="previewLibraryEmpty" data-map-id="AC.UI02.PREVIEW.LIBRARY.EMPTY">
        <div class="libraryEmptyGlyph" aria-hidden="true"><StudioIcon name="projects" /></div>
        <h2>{{ libraryQuery ? 'Không tìm thấy dự án' : 'Không có dự án nào' }}</h2>
        <p>{{ libraryQuery ? 'Thử tìm theo tên khác. Bộ lọc chỉ áp dụng cho dữ liệu preview.' : 'Chưa có dự án hiển thị. Bạn có thể tạo dự án DEMO trong bộ nhớ.' }}</p>
        <button type="button" class="previewPrimaryButton" data-map-id="AC.UI02.PREVIEW.PROJECT.NEW" @click="openProjectDialog('create')">Tạo dự án đầu tiên</button>
      </div>
      <div class="previewTrashSection">
        <button type="button" data-map-id="AC.UI02.PREVIEW.PROJECT.TRASH" :aria-expanded="trashOpen" aria-controls="preview-trash-list" @click="trashOpen = !trashOpen"><span><StudioIcon name="trash" /> Thùng rác · {{ deletedProjects.length }} dự án</span><StudioIcon name="chevron" :class="{ rotated: trashOpen }" /></button>
        <div v-if="trashOpen" id="preview-trash-list" class="previewTrashList" data-map-id="AC.UI02.PREVIEW.PROJECT.TRASH.LIST">
          <p v-if="!deletedProjects.length">Chưa có dự án trong thùng rác mẫu.</p>
          <div v-for="project in deletedProjects" :key="project.id" class="trashProject"><span><strong>{{ project.name }}</strong><small>Đã xóa mềm · DEMO</small></span><button type="button" data-map-id="AC.UI02.PREVIEW.PROJECT.RESTORE" :data-preview-project-id="project.id" @click="restoreProject(project.id)"><StudioIcon name="refresh" />Khôi phục</button></div>
        </div>
      </div>
    </section>

    <main v-else class="previewWorkspace" data-map-id="AC.UI02.PREVIEW.CANVAS">
      <aside v-if="variant === 'B'" class="previewSceneRail" aria-label="Danh sách cảnh quay">
        <header><span class="previewEyebrow">BẢNG DỰNG</span><h2>Scenes <span>{{ nodes.length }}</span></h2></header>
        <button type="button" class="sceneCreate" title="Mở bảng thêm node" aria-label="Mở bảng thêm node" data-map-id="AC.UI02.PREVIEW.ADD" @click="togglePalette"><StudioIcon name="plus" /> Thêm node</button>
        <div class="sceneRailList">
          <button v-for="(node, index) in nodes" :key="node.id" type="button" class="sceneRailItem" data-map-id="AC.UI02.PREVIEW.SCENE.SELECT" :data-preview-node-id="node.id" :class="{ active: selectedNodeId === node.id }" :title="'Chọn cảnh ' + String(node.data?.title || '')" @click="focusScene(node.id)">
            <span class="sceneNumber">{{ String(index + 1).padStart(2, '0') }}</span><span class="sceneLine"><strong>{{ String(node.data?.title || '') }}</strong><small>{{ node.type === 'text' ? 'Văn bản' : node.type === 'image' ? 'Khung hình' : 'Video' }}</small></span><span aria-hidden="true">›</span>
          </button>
        </div>
        <div class="sceneRailFooter"><span class="sceneRailDot"></span> Chế độ xem trước</div>
      </aside>

      <div ref="canvasElement" class="previewCanvasArea" data-map-id="AC.UI02.PREVIEW.STAGE">
        <VueFlow
          v-if="flowReady"
          :key="scenarioVersion"
          id="design-preview-flow"
          v-model:nodes="nodes"
          :edges="edges"
          :nodeTypes="nodeTypes"
          :minZoom="0.2"
          :maxZoom="2"
          :defaultViewport="{ x: 45, y: 45, zoom: 0.9 }"
          :fitViewOnInit="true"
          :isValidConnection="isValidConnection"
          :connectOnClick="true"
          :deleteKeyCode="null"
          @connect="onConnect"
          @nodeClick="onNodeClick"
          @paneClick="onPaneClick"
          @viewportChange="onViewportChange"
          @nodesInitialized="onPreviewNodesInitialized"
        >
          <template #node-text="props"><designPreviewNode v-bind="props" @inspect="openInspector" @delete="requestDelete('node', $event)" /></template>
          <template #node-image="props"><designPreviewNode v-bind="props" @inspect="openInspector" @delete="requestDelete('node', $event)" /></template>
          <template #node-video="props"><designPreviewNode v-bind="props" @inspect="openInspector" @delete="requestDelete('node', $event)" /></template>
        </VueFlow>

        <div v-if="!nodes.length" class="previewCanvasEmpty" data-map-id="AC.UI02.PREVIEW.EMPTY">
          <span class="canvasEmptySymbol" aria-hidden="true"><StudioIcon name="plus" /></span>
          <h2>Bắt đầu với một node</h2>
          <p>Thêm ý tưởng, hình ảnh hoặc video vào Canvas.</p>
          <button type="button" class="previewPrimaryButton" title="Mở bảng thêm node đầu tiên" data-map-id="AC.UI02.PREVIEW.ADD" @click="togglePalette"><StudioIcon name="plus" /> Thêm node đầu tiên</button>
        </div>

        <div v-if="variant === 'A'" class="previewFloatDock" data-map-id="AC.UI02.PREVIEW.DOCK" role="toolbar" aria-label="Dock công cụ Canvas">
          <button type="button" class="dockCreate" title="Thêm node" aria-label="Thêm node" :aria-expanded="paletteOpen" data-map-id="AC.UI02.PREVIEW.ADD" @click.stop="togglePalette"><StudioIcon name="plus" /></button>
          <span class="dockDivider"></span>
          <button type="button" data-map-id="AC.UI02.PREVIEW.PROJECTS" title="Mở thư viện dự án mẫu" aria-label="Mở thư viện dự án" @click="openProjectLibrary"><StudioIcon name="projects" /></button>
          <button type="button" data-map-id="AC.UI02.PREVIEW.FIT.DOCK" title="Vừa toàn bộ node vào Canvas" aria-label="Fit toàn bộ Canvas" @click="fitSoon"><StudioIcon name="fit" /></button>
          <span class="dockDivider" aria-hidden="true"></span>
          <button type="button" class="dockMore" data-map-id="AC.UI02.PREVIEW.DOCK.MORE" title="Thêm thao tác đã có" aria-label="Thêm thao tác Canvas" aria-haspopup="menu" aria-controls="preview-dock-more-menu" :aria-expanded="dockMoreOpen" @click.stop="toggleDockMenu"><StudioIcon name="more" /></button>
          <div v-if="dockMoreOpen" id="preview-dock-more-menu" class="previewDockMenu" data-map-id="AC.UI02.PREVIEW.DOCK.MENU" role="menu" aria-label="Thao tác Canvas hiện có" @pointerdown.stop @mousedown.stop @click.stop @keydown.esc.stop="dockMoreOpen = false">
            <span class="previewDockMenuLabel">THAO TÁC HIỆN CÓ</span>
            <button type="button" role="menuitem" data-map-id="AC.UI02.PREVIEW.DOCK.MENU.MEDIA" @click.stop="toggleDockMedia"><StudioIcon name="image" />{{ mediaMode === 'demo' ? 'Ẩn media DEMO' : 'Hiện media DEMO' }}</button>
            <button type="button" role="menuitem" data-map-id="AC.UI02.PREVIEW.DOCK.MENU.SCENES" @click.stop="showSevenScenes"><StudioIcon name="layers" />Xem workflow 7 node</button>
            <button v-if="selectedNodeId" type="button" role="menuitem" data-map-id="AC.UI02.PREVIEW.DOCK.MENU.INSPECTOR" @click.stop="openSelectedInspector"><StudioIcon name="info" />Mở Inspector</button>
            <button type="button" role="menuitem" data-map-id="AC.UI02.PREVIEW.DOCK.MENU.VARIANT" @click.stop="selectVariant('B')"><StudioIcon name="canvas" />Chuyển sang Cinematic Pro</button>
          </div>
        </div>

        <div class="previewCanvasInfo" :data-flow-state="flowDiagnostics"><span>{{ variant === 'A' ? 'KHÔNG GIAN SÁNG TẠO' : 'CANVAS / SCENE BOARD' }}</span><strong>{{ nodes.length }} node · {{ edges.length }} kết nối</strong></div>

        <div class="previewCanvasToolbar" data-map-id="AC.UI02.PREVIEW.TOOLBAR">
          <button type="button" data-map-id="AC.UI02.PREVIEW.ZOOM.OUT" title="Thu nhỏ" aria-label="Thu nhỏ" @click="zoomOut({ duration: 160 })"><StudioIcon name="minus" /></button>
          <span class="previewZoom">{{ zoomLabel }}</span>
          <button type="button" data-map-id="AC.UI02.PREVIEW.ZOOM.IN" title="Phóng to" aria-label="Phóng to" @click="zoomIn({ duration: 160 })"><StudioIcon name="plus" /></button>
          <i aria-hidden="true"></i>
          <button type="button" title="Vừa khung nhìn" aria-label="Vừa khung nhìn" data-map-id="AC.UI02.PREVIEW.FIT" @click="fitSoon"><StudioIcon name="fit" /></button>
          <button type="button" class="previewCreateButton" data-map-id="AC.UI02.PREVIEW.ADD" title="Thêm node" aria-label="Mở bảng thêm node" :aria-expanded="paletteOpen" @click.stop="togglePalette"><StudioIcon name="plus" /><span>Thêm</span></button>
        </div>

        <div class="previewCanvasQuickBar" role="toolbar" data-map-id="AC.UI02.PREVIEW.QUICKBAR" aria-label="Thanh công cụ Canvas">
          <button type="button" class="quickCreate" title="Mở bảng thêm node" aria-label="Mở bảng thêm node" @click.stop="togglePalette"><StudioIcon name="plus" /></button>
          <button type="button" title="Vừa toàn bộ workflow vào khung" aria-label="Vừa toàn bộ workflow vào khung" @click="fitSoon"><StudioIcon name="fit" /></button>
          <button type="button" title="Thêm ghi chú văn bản" aria-label="Thêm Text Node" @click="addPreviewNode('text')"><StudioIcon name="text" /></button>
          <button type="button" title="Thêm khung hình" aria-label="Thêm Image Node" @click="addPreviewNode('image')"><StudioIcon name="image" /></button>
          <button type="button" title="Thêm cảnh video" aria-label="Thêm Video Node" @click="addPreviewNode('video')"><StudioIcon name="video" /></button>
          <span class="quickBarSeparator" aria-hidden="true"></span>
          <button type="button" :aria-pressed="mediaMode === 'demo'" title="Chuyển Compact / Media DEMO" aria-label="Chuyển Compact và Media DEMO" @click="toggleDockMedia"><StudioIcon name="layers" /></button>
          <button type="button" title="Xem workflow bảy node" aria-label="Xem workflow 7 node" @click="showSevenScenes"><StudioIcon name="canvas" /></button>
          <button type="button" class="quickComposer" data-map-id="AC.UI02.PREVIEW.COMPOSER.TOGGLE" title="Mở khung nhập prompt như ảnh tham chiếu" aria-label="Mở khung nhập Canvas" :aria-expanded="composerOpen" @click.stop="toggleComposer"><StudioIcon name="spark" /></button>
        </div>

        <section v-if="composerOpen" class="previewComposer nodrag nowheel" data-map-id="AC.UI02.PREVIEW.COMPOSER" aria-label="Khung nhập ý tưởng Canvas" @pointerdown.stop @mousedown.stop @click.stop @wheel.stop @keydown.esc.stop="composerOpen = false">
          <div class="composerActionRow">
            <button type="button" class="composerIconButton" title="Tải ảnh tham chiếu từ máy" aria-label="Tải ảnh tham chiếu từ máy" @click="composerFileInput?.click()"><StudioIcon name="plus" /><span>Tải ảnh</span></button>
            <input ref="composerFileInput" type="file" accept="image/*" multiple hidden aria-label="Chọn ảnh tham chiếu" @change="addComposerFiles" />
            <button type="button" class="composerIconButton" :aria-expanded="composerPickerOpen" title="Chọn ảnh DEMO làm tham chiếu" @click="composerPickerOpen = !composerPickerOpen"><StudioIcon name="image" /><span>Ảnh tham chiếu</span></button>
            <button type="button" class="composerIconButton" :aria-pressed="composerMarked" title="Đánh dấu cảnh để nhận biết trong prompt" @click="composerMarked = !composerMarked"><StudioIcon name="fit" /><span>{{ composerMarked ? 'Đã đánh dấu' : 'Đánh dấu' }}</span></button>
            <span class="composerActionSpacer"></span>
            <span class="composerDemoPill">CHỈ GIAO DIỆN DEMO</span>
            <button type="button" class="composerDismiss" data-map-id="AC.UI02.PREVIEW.COMPOSER.CLOSE" title="Đóng khung nhập" aria-label="Đóng khung nhập" @click="composerOpen = false"><StudioIcon name="close" /></button>
          </div>
          <div v-if="composerPickerOpen" class="composerReferencePicker" role="group" aria-label="Chọn ảnh tham chiếu minh họa">
            <button v-for="item in composerStockReferences" :key="item.src" type="button" :title="'Thêm tham chiếu ' + item.name" @click="appendComposerReference(item.src, item.name, false)"><img :src="item.src" :alt="item.name" /><span>{{ item.name }}</span></button>
          </div>
          <div v-if="composerReferences.length" class="composerReferenceList" aria-label="Hình tham chiếu đang chọn">
            <div v-for="item in composerReferences" :key="item.id" class="composerReferenceCard"><img :src="item.src" :alt="'Tham chiếu ' + item.name" /><button type="button" :aria-label="'Xóa tham chiếu ' + item.name" title="Xóa ảnh tham chiếu" @click="removeComposerReference(item.id)"><StudioIcon name="close" /></button></div>
          </div>
          <textarea ref="composerInput" v-model="composerPrompt" data-map-id="AC.UI02.PREVIEW.COMPOSER.INPUT" class="composerTextarea" rows="4" spellcheck="false" aria-label="Nhập mô tả Canvas" placeholder="Nhập mô tả để tạo ảnh, video hoặc ý tưởng; tải ảnh lên rồi nhập hướng dẫn chỉnh sửa. Đây là bản xem trước, không gửi AI." @keydown.ctrl.enter.prevent="submitComposer" @keydown.meta.enter.prevent="submitComposer"></textarea>
          <div class="composerFooter">
            <label class="composerModelSelect"><span>Loại node</span><select v-model="composerKind" data-map-id="AC.UI02.PREVIEW.COMPOSER.KIND" aria-label="Chọn loại node"><option value="image">Tạo ảnh</option><option value="video">Tạo video</option><option value="text">Văn bản</option></select></label>
            <label class="composerRatio"><span>Tỷ lệ</span><select v-model="composerAspect" aria-label="Chọn tỷ lệ khung hình"><option value="16:9">16:9</option><option value="1:1">1:1</option><option value="9:16">9:16</option></select></label>
            <span class="composerFootNote">{{ composerKind === 'video' ? '5 giây · 1 video DEMO' : composerKind === 'image' ? '1 ảnh minh họa · DEMO' : '1 ghi chú · DEMO' }}</span>
            <button type="button" class="composerSubmit" data-map-id="AC.UI02.PREVIEW.COMPOSER.SUBMIT" :disabled="!composerPrompt.trim()" :title="selectedNodeId ? 'Lưu mô tả cho node đã chọn' : 'Tạo node mới với mô tả này'" @click="submitComposer"><StudioIcon name="plus" /><span>{{ selectedNodeId ? 'Cập nhật' : 'Thêm vào Canvas' }}</span></button>
          </div>
          <p class="composerHint">Ảnh tham chiếu chỉ hiển thị tạm trong khung nhập. Prompt và node lưu trong bộ nhớ của preview, không gửi AI hay SQLite.</p>
        </section>

        <section v-if="paletteOpen" class="previewPalette" data-map-id="AC.UI02.PREVIEW.PALETTE" role="dialog" aria-label="Chọn loại node" @pointerdown.stop @mousedown.stop @wheel.stop @click.stop @keydown.esc.stop="closePalette">
          <div class="paletteTop"><div><span class="previewEyebrow">NODE PALETTE · DEMO</span><strong>Thêm vào Canvas</strong></div><button type="button" title="Đóng bảng chọn node" aria-label="Đóng Palette" data-map-id="AC.UI02.PREVIEW.PALETTE.CLOSE" @click="closePalette"><StudioIcon name="close" /></button></div>
          <label class="previewSearch paletteSearch"><StudioIcon name="search" /><input ref="paletteInput" v-model="paletteQuery" data-map-id="AC.UI02.PREVIEW.PALETTE.SEARCH" type="search" placeholder="Tìm Văn bản, Hình ảnh, Video..." aria-label="Tìm loại node" autocomplete="off" /></label>
          <p class="previewEyebrow">3 LOẠI NODE HIỆN CÓ</p>
          <button v-for="kind in visibleKinds" :key="kind.id" type="button" class="previewPaletteItem" :data-map-id="'AC.UI02.PREVIEW.ADD.' + kind.id.toUpperCase()" @click="addPreviewNode(kind.id)"><span class="previewPaletteItemIcon" :class="'kind-' + kind.id"><StudioIcon :name="kind.id" /></span><span><strong>{{ kind.label }}</strong><small>{{ kind.description }}</small></span><StudioIcon name="plus" /></button>
          <p v-if="!visibleKinds.length" class="paletteNoMatch">Không tìm thấy node phù hợp.</p>
        </section>

        <div v-if="previewStatus !== 'normal'" class="previewStateAlert" :class="previewStatus" data-map-id="AC.UI02.PREVIEW.SIMULATED.STATUS" role="status">
          <span class="stateAlertIcon" aria-hidden="true"><StudioIcon :name="previewStatus === 'loading' ? 'refresh' : previewStatus === 'saved' ? 'fit' : previewStatus === 'empty' ? 'projects' : 'info'" /></span><div><small>TRẠNG THÁI DEMO · {{ statusLabel }} · KHÔNG GỌI API</small><p>{{ statusText }}</p></div>
          <button type="button" data-map-id="AC.UI02.PREVIEW.STATUS.DISMISS" @click="previewStatus = 'normal'">Đóng mô phỏng</button>
        </div>
      </div>

      <aside v-if="inspectorOpen && selectedNode" ref="inspectorElement" class="previewInspector" data-map-id="AC.UI02.PREVIEW.INSPECTOR" aria-label="Inspector node">
        <div class="inspectorTop"><span class="previewEyebrow">INSPECTOR · DEMO</span><button type="button" title="Đóng Inspector" aria-label="Đóng Inspector" data-map-id="AC.UI02.PREVIEW.INSPECTOR.CLOSE" @click="inspectorOpen = false"><StudioIcon name="close" /></button></div>
        <div class="inspectorIdentity"><div class="inspectorIcon"><StudioIcon :name="selectedNode.type === 'text' ? 'text' : selectedNode.type === 'image' ? 'image' : 'video'" /></div><div><h2>{{ String(selectedNode.data?.title || '') }}</h2><p>{{ selectedNode.type === 'text' ? 'Ghi chú sáng tạo' : selectedNode.type === 'image' ? 'Khung hình tĩnh' : 'Cảnh chuyển động' }}</p></div></div>
        <label class="inspectorPromptLabel" for="design-preview-prompt">Mô tả sáng tạo</label>
        <textarea id="design-preview-prompt" v-model="selectedPrompt" class="inspectorTextarea" rows="7" spellcheck="false" data-map-id="AC.UI02.PREVIEW.INSPECTOR.PROMPT" @wheel.stop></textarea>
        <div class="inspectorMetadata"><span>Đầu vào <strong>{{ edges.filter(edge => edge.target === selectedNodeId).length }}</strong></span><span>Đầu ra <strong>{{ edges.filter(edge => edge.source === selectedNodeId).length }}</strong></span></div>
        <div class="inspectorStatus" data-map-id="AC.UI02.PREVIEW.INSPECTOR.STATUS"><span class="previewDemoDot"></span><div><strong>{{ selectedNode.type === 'text' ? 'Nội dung trong bộ nhớ' : selectedNode.data?.demo ? 'Media minh họa DEMO' : 'Chưa kết nối AI' }}</strong><small>Chưa lưu kết quả AI · Không gọi máy chủ</small></div></div>
        <p class="inspectorNote">Thay đổi prompt được đồng bộ ngay trên node trong bản xem trước. Không ghi SQLite.</p>
        <details class="inspectorTechnical"><summary>Thông tin kỹ thuật mẫu</summary><code>{{ selectedNode.id }}</code></details>
        <button type="button" class="inspectorSecondaryButton" data-map-id="AC.UI02.PREVIEW.INSPECTOR.FOOTER.CLOSE" @click="inspectorOpen = false">Đóng bảng chi tiết</button>
      </aside>

      <div v-if="variant === 'B'" class="previewShotStrip" aria-label="Điều hướng các cảnh trong workflow">
        <div class="shotStripTitle"><span>SHOT OVERVIEW</span><strong>{{ nodes.length }} cảnh / node</strong></div>
        <div class="shotStripItems">
          <button v-for="(node, index) in nodes" :key="node.id" type="button" :title="'Xem cảnh ' + String(node.data?.title || '')" data-map-id="AC.UI02.PREVIEW.SCENE.SELECT" :data-preview-node-id="node.id" :class="{ current: selectedNodeId === node.id }" @click="focusScene(node.id)">
            <img v-if="node.type !== 'text' && mediaMode === 'demo'" :src="String(node.data?.poster || '')" alt="" /><span v-else class="shotTextGlyph" aria-hidden="true">{{ node.type === 'text' ? '✎' : node.type === 'image' ? '▧' : '▣' }}</span>
            <span>0{{ index + 1 }} · {{ String(node.data?.title || '') }}</span>
          </button>
        </div>
      </div>
    </main>

    <dialog ref="deleteDialog" class="previewDialog" aria-labelledby="preview-delete-title" aria-describedby="preview-delete-desc" @cancel="onDialogCancel($event, 'delete')" @click="onDialogBackdrop($event, 'delete')">
      <h2 id="preview-delete-title">{{ deleteKind === 'node' ? 'Xóa node khỏi Canvas?' : 'Chuyển dự án vào thùng rác?' }}</h2><p id="preview-delete-desc">{{ deleteKind === 'node' ? 'Các kết nối liên quan sẽ bị bỏ khỏi bản xem trước.' : 'Có thể khôi phục dự án từ Thùng rác. Không xóa vĩnh viễn.' }} Dữ liệu chỉ ở trong tab, không gửi API.</p>
      <div class="dialogButtons"><button ref="deleteCancelButton" type="button" data-map-id="AC.UI02.PREVIEW.DELETE.CANCEL" @click="cancelDeleteDialog">Hủy</button><button type="button" class="dangerButton" data-map-id="AC.UI02.PREVIEW.DELETE.CONFIRM" @click="confirmDelete">{{ deleteKind === 'node' ? 'Xóa node' : 'Xóa mềm' }}</button></div>
    </dialog>
    <dialog ref="projectDialog" class="previewDialog" aria-labelledby="preview-project-dialog-title" @cancel="onDialogCancel($event, 'project')" @click="onDialogBackdrop($event, 'project')">
      <h2 id="preview-project-dialog-title">{{ projectDialogMode === 'create' ? 'Tạo dự án mẫu' : 'Đổi tên dự án mẫu' }}</h2><p>Mọi thay đổi trong bản xem trước đều chỉ nằm trong bộ nhớ trình duyệt.</p>
      <label class="dialogField">Tên dự án <input ref="projectNameInput" v-model="projectDraft" data-map-id="AC.UI02.PREVIEW.PROJECT.DIALOG.NAME" type="text" maxlength="80" autocomplete="off" @keydown.enter.prevent="confirmProject" /></label>
      <div class="dialogButtons"><button type="button" data-map-id="AC.UI02.PREVIEW.PROJECT.DIALOG.CANCEL" @click="cancelProjectDialog">Hủy</button><button type="button" class="previewPrimaryButton" data-map-id="AC.UI02.PREVIEW.PROJECT.DIALOG.CONFIRM" :disabled="!projectDraft.trim()" @click="confirmProject">Xác nhận</button></div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { VueFlow, useVueFlow, type Connection, type Edge, type Node } from "@vue-flow/core";
import StudioIcon from "../components/StudioIcon.vue";
import designPreviewNode from "./designPreviewNode.vue";

type Variant = "A" | "B";
type NodeKind = "text" | "image" | "video";
type PreviewScreen = "home" | "library" | "canvas";
type ImageAspect = "16:9" | "1:1" | "9:16";
type ComposerReference = { id: number; src: string; name: string; objectUrl: boolean };
type LibraryProject = { id: string; name: string; description: string; poster: string; deleted: boolean };
type PreviewStatus = "normal" | "empty" | "loading" | "saved" | "unsaved" | "offline" | "save503" | "conflict409";
const params = new URLSearchParams(window.location.search);
const variant = ref<Variant>(params.get("designPreview") === "B" ? "B" : "A");
const scenario = ref<"three" | "seven" | "empty">(params.get("scenario") === "seven" ? "seven" : params.get("scenario") === "empty" ? "empty" : "three");
const mediaMode = ref<"demo" | "compact">(params.get("media") === "compact" ? "compact" : "demo");
// Keep historical ?designPreview=A/B defaulting to Canvas for existing QA.
// The new visual landing page is available at ?designPreview=A&screen=home.
const screen = ref<PreviewScreen>(params.get("screen") === "home" ? "home" : params.get("screen") === "library" ? "library" : "canvas");
const previewStatus = ref<PreviewStatus>("normal");
const libraryMode = ref<"projects" | "empty">(params.get("empty") === "1" ? "empty" : "projects");
const activeProjectName = ref("Phố đêm · Series 01");
const previewProjects = ref<LibraryProject[]>([
  { id: "preview-project-one", name: "Phố đêm · Series 01", description: "Phim ngắn • Cảnh phố dưới mưa", poster: "/designPreview/streetFrame.svg", deleted: false },
  { id: "preview-project-two", name: "Nhân vật và ánh sáng", description: "Bảng hình ảnh • Chân dung", poster: "/designPreview/portraitFrame.svg", deleted: false },
  { id: "preview-project-three", name: "Đêm neon Tokyo", description: "Chuỗi cảnh • Thiết kế chuyển động", poster: "/designPreview/alleyFrame.svg", deleted: false },
]);
const libraryQuery = ref("");
const trashOpen = ref(false);
const openProjectMenuId = ref("");
const composerOpen = ref(false);
const composerPrompt = ref("");
const composerKind = ref<NodeKind>("image");
const composerAspect = ref<ImageAspect>("16:9");
const composerMarked = ref(false);
const composerPickerOpen = ref(false);
const composerInput = ref<HTMLTextAreaElement>();
const composerFileInput = ref<HTMLInputElement>();
const composerReferences = ref<ComposerReference[]>([]);
let nextComposerReferenceId = 0;
const composerStockReferences = [
  { src: "/designPreview/streetFrame.svg", name: "Phố đêm" },
  { src: "/designPreview/portraitFrame.svg", name: "Chân dung" },
  { src: "/designPreview/alleyFrame.svg", name: "Ngõ neon" },
] as const;
const homeShortcuts = [
  { label: "Ghi chú", description: "Thêm node văn bản", icon: "text", action: "text" },
  { label: "Tạo hình ảnh", description: "Thêm node hình ảnh DEMO", icon: "image", action: "image" },
  { label: "Tạo video", description: "Thêm node video CC0 DEMO", icon: "video", action: "video" },
  { label: "Canvas", description: "Mở Canvas", icon: "canvas", action: "canvas" },
  { label: "7 phân cảnh", description: "Mở workflow 7 node", icon: "layers", action: "seven" },
  { label: "Prompt", description: "Mở khung nhập ý tưởng", icon: "spark", action: "composer" },
  { label: "Dự án", description: "Mở thư viện dự án", icon: "projects", action: "library" },
  { label: "Media DEMO", description: "Bật/tắt media minh họa", icon: "fit", action: "media" },
] as const;
const visibleProjects = computed(() => libraryMode.value === "empty" ? [] : previewProjects.value.filter(p => !p.deleted && p.name.toLocaleLowerCase("vi-VN").includes(libraryQuery.value.toLocaleLowerCase("vi-VN"))));
const deletedProjects = computed(() => previewProjects.value.filter(p => p.deleted));
const paletteOpen = ref(false);
const paletteQuery = ref("");
const paletteInput = ref<HTMLInputElement>();
let paletteTrigger: HTMLElement | null = null;
const dockMoreOpen = ref(false);
const inspectorOpen = ref(false);
const inspectorElement = ref<HTMLElement>();
const canvasElement = ref<HTMLElement>();
const selectedNodeId = ref<string | null>(null);
const deleteDialog = ref<HTMLDialogElement>();
const deleteCancelButton = ref<HTMLButtonElement>();
const projectDialog = ref<HTMLDialogElement>();
const projectNameInput = ref<HTMLInputElement>();
const deleteKind = ref<"node" | "project">("node");
const deleteTargetId = ref("");
const projectDialogMode = ref<"create" | "rename">("create");
const projectTargetId = ref("");
const projectDraft = ref("");
let createdProjectCount = 0;
let createdNodeCount = 0;
let projectCommitPending = false;
let deleteCommitPending = false;
let projectCloseTimer: ReturnType<typeof setTimeout> | undefined;
let deleteCloseTimer: ReturnType<typeof setTimeout> | undefined;
const nodeTypes = { text: markRaw(designPreviewNode), image: markRaw(designPreviewNode), video: markRaw(designPreviewNode) };
const kinds: { id: NodeKind; label: string; description: string }[] = [
  { id: "text", label: "Văn bản", description: "Viết ý tưởng và câu chuyện" },
  { id: "image", label: "Hình ảnh", description: "Tạo bố cục và prompt hình ảnh" },
  { id: "video", label: "Video", description: "Phác thảo chuyển động và cảnh quay" },
];
const visibleKinds = computed(() => kinds.filter(kind => (kind.label + " " + kind.description + " " + kind.id).toLocaleLowerCase("vi-VN").includes(paletteQuery.value.trim().toLocaleLowerCase("vi-VN"))));
// MDN's CC0 example clip is shipped locally for reliable DEV-only playback.
// See docs/evidence/ui02/command3/README.md for source and license attribution.
const videoSrc = "/designPreview/flower-cc0.webm";
const initialNodes: Node[] = [
  { id: "preview-text-01", type: "text", position: { x: 40, y: 190 }, data: { title: "Ý tưởng mở đầu", shot: "CẢNH 01", prompt: "Một người đàn ông bước qua con phố về đêm. Ánh đèn neon phản chiếu trên mặt đường ướt, không gian tĩnh lặng.", demo: true } },
  { id: "preview-image-01", type: "image", position: { x: 390, y: 80 }, data: { title: "Phố đêm dưới mưa", shot: "01", prompt: "Khung hình điện ảnh. Một người cô độc bước dưới đèn đường, màu xanh đêm và cam ấm, ống kính 35mm.", poster: "/designPreview/streetFrame.svg", aspectRatio: "16:9", demo: true } },
  { id: "preview-video-01", type: "video", position: { x: 820, y: 50 }, data: { title: "Chuyển động nhẹ", shot: "01", prompt: "Máy quay dolly chậm, hình ảnh chuyển động tự nhiên. Clip CC0 hoa nở chỉ dùng để thử điều khiển phát video.", poster: "/designPreview/flowerFrame.svg", videoSrc, demo: true } },
  { id: "preview-text-02", type: "text", position: { x: 30, y: 600 }, data: { title: "Phân cảnh thứ hai", shot: "CẢNH 02", prompt: "Máy quay đổi góc nhìn. Giữ nhịp kể chuyện chậm, âm thanh mưa bên ngoài cửa kính.", demo: true } },
  { id: "preview-image-02", type: "image", position: { x: 395, y: 560 }, data: { title: "Chân dung trong đêm", shot: "02", prompt: "Chân dung điện ảnh, ánh sáng ngang gò má, biểu cảm tự nhiên, nền thành phố bokeh.", poster: "/designPreview/portraitFrame.svg", aspectRatio: "9:16", demo: true } },
  { id: "preview-image-03", type: "image", position: { x: 790, y: 560 }, data: { title: "Ngõ neon", shot: "03", prompt: "Con hẻm dưới trời mưa với biển hiệu phản chiếu, độ sâu phối cảnh rõ ràng, màu điện ảnh.", poster: "/designPreview/alleyFrame.svg", aspectRatio: "1:1", demo: true } },
  { id: "preview-video-02", type: "video", position: { x: 1210, y: 540 }, data: { title: "Cảnh thiên nhiên", shot: "02", prompt: "Clip hoa CC0 dùng để thử phát/tạm dừng, không phải video AI sinh ra từ cảnh phố đêm.", poster: "/designPreview/flowerFrame.svg", videoSrc, demo: true } },
];
const initialEdges: Edge[] = [
  { id: "preview-edge-01", source: "preview-text-01", sourceHandle: "output", target: "preview-image-01", targetHandle: "input" },
  { id: "preview-edge-02", source: "preview-image-01", sourceHandle: "output", target: "preview-video-01", targetHandle: "input" },
  { id: "preview-edge-03", source: "preview-text-01", sourceHandle: "output", target: "preview-video-01", targetHandle: "input" },
  { id: "preview-edge-04", source: "preview-text-02", sourceHandle: "output", target: "preview-image-02", targetHandle: "input" },
  { id: "preview-edge-05", source: "preview-image-03", sourceHandle: "output", target: "preview-video-02", targetHandle: "input" },
];
const nodes = shallowRef<Node[]>([]);
const edges = shallowRef<Edge[]>([]);
const viewport = ref({ x: 0, y: 0, zoom: 0.9 });
type PreviewFlowApi = {
  zoomIn: (options?: { duration?: number }) => void;
  zoomOut: (options?: { duration?: number }) => void;
  fitView: (options?: { padding?: number; maxZoom?: number; duration?: number }) => Promise<boolean>;
  getViewport: () => { x: number; y: number; zoom: number };
  setViewport: (viewport: { x: number; y: number; zoom: number }, options?: { duration?: number }) => Promise<boolean>;
  updateNodeData: (id: string, patch: { prompt?: string }) => void;
  setEdges: (edges: Edge[]) => void;
  getEdges: { value: Edge[] };
  getNodes: { value: Array<{ id: string; dimensions?: { width: number; height: number }; handleBounds?: unknown; initialized?: boolean }> };
};
// Vue Flow's deep generic graph types exceed vue-tsc's inference depth in this preview.
// Only the six public methods used here are exposed to the local component.
const { zoomIn, zoomOut, fitView, getViewport, setViewport, updateNodeData, setEdges, getEdges, getNodes } =
  useVueFlow({ id: "design-preview-flow" }) as unknown as PreviewFlowApi;
const flowDiagnostics = computed(() => JSON.stringify({
  stateEdges: getEdges.value?.length ?? null,
  stateNodes: getNodes.value?.map(n => ({ id: n.id, dimensions: n.dimensions, initialized: n.initialized, handles: n.handleBounds })) ?? null,
}));
const zoomLabel = computed(() => Math.round(viewport.value.zoom * 100) + "%");
const selectedNode = computed(() => nodes.value.find(node => node.id === selectedNodeId.value));
const selectedPrompt = computed({
  get: () => String(selectedNode.value?.data?.prompt || ""),
  set: (value: string) => { if (selectedNodeId.value) updateNodeData(selectedNodeId.value, { prompt: value }); },
});
const statusLabels: Record<PreviewStatus, string> = {
  normal: "Bình thường", empty: "Empty", loading: "Loading", saved: "Saved",
  unsaved: "Unsaved", offline: "Offline", save503: "Error 503", conflict409: "Conflict 409",
};
const statusLabel = computed(() => statusLabels[previewStatus.value]);
const statusText = computed(() => ({
  normal: "",
  empty: "Minh họa trạng thái chưa có nội dung. Chọn Canvas trống hoặc thư viện trống để kiểm tra empty state thực tế.",
  loading: "Minh họa trạng thái đang tải; không có request tải hoặc công việc AI nào được thực hiện.",
  saved: "Mẫu nhãn đã lưu. Không có lần lưu xuống server hay SQLite nào trong bản preview.",
  unsaved: "Mẫu nhãn chưa lưu. Nội dung hiện chỉ giữ trong bộ nhớ và mất khi tải lại trang.",
  offline: "Minh họa mất kết nối. Bản xem trước không kiểm tra kết nối máy chủ thực.",
  save503: "Mô phỏng lỗi giao diện 503. Không gửi yêu cầu lưu và không có lỗi backend thực tế.",
  conflict409: "Mô phỏng xung đột phiên bản 409. Prompt vẫn giữ trong bộ nhớ, không kiểm tra revision backend.",
})[previewStatus.value]);

const flowReady = ref(false);
let awaitingMeasuredEdges: Edge[] = [];
function onPreviewNodesInitialized() {
  if (!flowReady.value || !awaitingMeasuredEdges.length) return;
  setEdges(awaitingMeasuredEdges);
  awaitingMeasuredEdges = [];
  fitSoon();
}
let scenarioVersion = 0;
async function applyScenario() {
  // Fully unmount the previous Vue Flow instance before replacing its graph.
  // Its pending v-model emits can otherwise overwrite edges during empty→populated transitions.
  const version = ++scenarioVersion;
  flowReady.value = false;
  await nextTick();
  if (version !== scenarioVersion) return;
  const count = scenario.value === "empty" ? 0 : scenario.value === "seven" ? 7 : 3;
  const nextNodes = initialNodes.slice(0, count).map(node => ({ ...node, position: { ...node.position }, data: { ...node.data, demo: mediaMode.value === "demo" } }));
  const nodeIds = new Set(nextNodes.map(node => node.id));
  nodes.value = nextNodes;
  edges.value = initialEdges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  awaitingMeasuredEdges = [...edges.value];
  selectedNodeId.value = null;
  inspectorOpen.value = false;
  flowReady.value = true;
  await nextTick();
  if (version !== scenarioVersion) return;
  // The preview is mounted only now: write the graph to the mounted flow store.
  // Edges passed before mount remain in parent state but are not registered.
  setEdges([...edges.value]);
  fitSoon();
}
function fitSoon() { void nextTick(() => { void fitView({ padding: 0.2, maxZoom: 1.05, duration: 240 }); }); }
function selectVariant(next: Variant) {
  dockMoreOpen.value = false;
  variant.value = next;
  const url = new URL(window.location.href);
  url.searchParams.set("designPreview", next);
  history.replaceState(null, "", url.pathname + url.search);
  fitSoon();
}
function dismissOverlays() { paletteOpen.value = false; openProjectMenuId.value = ""; dockMoreOpen.value = false; composerPickerOpen.value = false; }
function changeScreen(next: PreviewScreen) {
  screen.value = next;
  const url = new URL(window.location.href);
  if (next === "canvas") url.searchParams.delete("screen");
  else url.searchParams.set("screen", next);
  history.replaceState(null, "", url.pathname + url.search);
}
function openHome() { changeScreen("home"); composerOpen.value = false; dismissOverlays(); }
function openCanvas() { changeScreen("canvas"); composerOpen.value = false; dismissOverlays(); fitSoon(); }
function startEmptyCanvas() {
  changeScreen("canvas");
  scenario.value = "empty";
  dismissOverlays();
  composerOpen.value = true;
  composerPrompt.value = "";
  selectedNodeId.value = null;
  void nextTick(() => composerInput.value?.focus());
}
function openCanvasWithScenario(next: "three" | "seven") {
  changeScreen("canvas");
  scenario.value = next;
  dismissOverlays();
  fitSoon();
}
function openCanvasAndAdd(kind: NodeKind) {
  changeScreen("canvas");
  dismissOverlays();
  void nextTick(() => { addPreviewNode(kind); });
}
function runHomeShortcut(action: typeof homeShortcuts[number]["action"]) {
  if (action === "text" || action === "image" || action === "video") return openCanvasAndAdd(action);
  if (action === "library") return openProjectLibrary();
  if (action === "seven") return openCanvasWithScenario("seven");
  if (action === "media") { changeScreen("canvas"); toggleDockMedia(); fitSoon(); return; }
  if (action === "composer") { changeScreen("canvas"); toggleComposer(); return; }
  openCanvas();
}
function openProjectLibrary() { changeScreen("library"); composerOpen.value = false; dismissOverlays(); }
function openPreviewProject(id: string) {
  const project = previewProjects.value.find(value => value.id === id && !value.deleted);
  if (!project) return;
  activeProjectName.value = project.name;
  changeScreen("canvas");
  libraryQuery.value = "";
  dismissOverlays();
  fitSoon();
}
function toggleProjectLibrary() {
  if (screen.value === "library") { openCanvas(); }
  else openProjectLibrary();
}
function toggleDockMenu() {
  dockMoreOpen.value = !dockMoreOpen.value;
  if (dockMoreOpen.value) paletteOpen.value = false;
}
function toggleDockMedia() {
  mediaMode.value = mediaMode.value === "demo" ? "compact" : "demo";
  dockMoreOpen.value = false;
}
function showSevenScenes() { scenario.value = "seven"; dockMoreOpen.value = false; }
function openSelectedInspector() {
  dockMoreOpen.value = false;
  if (selectedNodeId.value) openInspector(selectedNodeId.value);
}
function togglePalette() {
  dockMoreOpen.value = false;
  if (paletteOpen.value) { closePalette(); return; }
  paletteTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  paletteQuery.value = "";
  paletteOpen.value = true;
  void nextTick(() => paletteInput.value?.focus());
}
function closePalette() {
  paletteOpen.value = false;
  const target = paletteTrigger;
  paletteTrigger = null;
  if (target?.isConnected) void nextTick(() => target.focus());
}
function addPreviewNode(kind: NodeKind, values?: { prompt?: string; aspectRatio?: ImageAspect }) {
  const number = Math.max(nodes.value.length + 1, ++createdNodeCount);
  const id = "preview-" + kind + "-added-" + number;
  nodes.value = [...nodes.value, {
    id,
    type: kind,
    position: { x: 160 + (number % 4) * 240, y: 190 + Math.floor(number / 4) * 300 },
    data: { title: kind === "text" ? "Văn bản" : kind === "image" ? "Tạo ảnh" : "Tạo video", shot: "MỚI", prompt: values?.prompt || "Nhập ý tưởng cho cảnh mới...", poster: kind === "video" ? "/designPreview/flowerFrame.svg" : "/designPreview/streetFrame.svg", videoSrc, aspectRatio: values?.aspectRatio || "16:9", demo: mediaMode.value === "demo" && kind !== "text" },
  }];
  paletteOpen.value = false;
  paletteTrigger = null;
  // Creating a node should not automatically open the Inspector or zoom the
  // new card to 200% on an otherwise empty Canvas. Keep its toolbar selected,
  // then fit at a human-readable scale after Vue Flow measures the card.
  focusScene(id, false);
  window.setTimeout(fitSoon, 90);
  return id;
}
function toggleComposer() {
  composerOpen.value = !composerOpen.value;
  paletteOpen.value = false;
  if (!composerOpen.value) { composerPickerOpen.value = false; return; }
  if (selectedNode.value) {
    composerPrompt.value = String(selectedNode.value.data?.prompt || "");
    if (selectedNode.value.type === "text" || selectedNode.value.type === "image" || selectedNode.value.type === "video") composerKind.value = selectedNode.value.type;
    const aspect = selectedNode.value.data?.aspectRatio;
    if (aspect === "16:9" || aspect === "1:1" || aspect === "9:16") composerAspect.value = aspect;
  }
  void nextTick(() => composerInput.value?.focus());
}
function appendComposerReference(src: string, name: string, objectUrl: boolean) {
  if (composerReferences.value.length >= 4) { if (objectUrl) URL.revokeObjectURL(src); return; }
  composerReferences.value.push({ id: ++nextComposerReferenceId, src, name, objectUrl });
  composerPickerOpen.value = false;
}
function removeComposerReference(id: number) {
  const reference = composerReferences.value.find(item => item.id === id);
  if (reference?.objectUrl) URL.revokeObjectURL(reference.src);
  composerReferences.value = composerReferences.value.filter(item => item.id !== id);
}
function addComposerFiles(event: Event) {
  const input = event.target as HTMLInputElement;
  for (const file of Array.from(input.files || []).filter(item => item.type.startsWith("image/"))) {
    appendComposerReference(URL.createObjectURL(file), file.name, true);
  }
  input.value = "";
}
function submitComposer() {
  const value = composerPrompt.value.trim();
  if (!value) return;
  if (selectedNodeId.value && nodes.value.some(node => node.id === selectedNodeId.value)) {
    updateNodeData(selectedNodeId.value, { prompt: value });
  } else {
    addPreviewNode(composerKind.value, { prompt: value, aspectRatio: composerAspect.value });
  }
  composerOpen.value = false;
  composerPickerOpen.value = false;
  inspectorOpen.value = false;
}
function isValidConnection(connection: Connection | Edge) {
  if (!connection.source || !connection.target || connection.source === connection.target) return false;
  if (connection.sourceHandle !== "output" || connection.targetHandle !== "input") return false;
  const source = nodes.value.find(node => node.id === connection.source);
  const target = nodes.value.find(node => node.id === connection.target);
  const allowed = (source?.type === "text" && (target?.type === "image" || target?.type === "video")) || (source?.type === "image" && target?.type === "video");
  // Vue Flow also validates existing edges when it hydrates the graph. An edge
  // must not be rejected as a duplicate of itself during that process.
  const hydratedEdgeId = "id" in connection ? connection.id : undefined;
  return !!allowed && !edges.value.some(edge => edge.source === connection.source && edge.target === connection.target && edge.id !== hydratedEdgeId);
}
function onConnect(connection: Connection) {
  if (!isValidConnection(connection)) return;
  edges.value = [...edges.value, { id: "preview-edge-" + Math.random().toString(36).slice(2), source: connection.source, target: connection.target, sourceHandle: "output", targetHandle: "input" }];
}
function onNodeClick(event: { node: Node }) { focusScene(event.node.id, false); }
function onPaneClick() {
  paletteOpen.value = false;
  dockMoreOpen.value = false;
  selectedNodeId.value = null;
  inspectorOpen.value = false;
  nodes.value = nodes.value.map(node => ({ ...node, selected: false }));
}
function onViewportChange(value: { x: number; y: number; zoom: number }) { viewport.value = { ...value }; }
function focusScene(id: string, inspect = true) {
  selectedNodeId.value = id;
  nodes.value = nodes.value.map(node => ({ ...node, selected: node.id === id }));
  inspectorOpen.value = inspect;
  if (inspect) void nextTick(ensureNodeVisible);
}
function openInspector(id: string) { focusScene(id); }
async function ensureNodeVisible() {
  if (!inspectorOpen.value || !selectedNodeId.value) return;
  const nodeElement = document.querySelector<HTMLElement>('[data-preview-node="' + selectedNodeId.value + '"]');
  const inspector = inspectorElement.value;
  if (!nodeElement || !inspector) return;
  const nodeRect = nodeElement.getBoundingClientRect(), panelRect = inspector.getBoundingClientRect();
  if (variant.value === "A") {
    // Mobile A uses a low floating Inspector rather than a full-height right
    // overlay. Move only the viewport vertically if it obscures the chosen
    // node: never change its node.position / persisted graph coordinates.
    if (window.innerWidth <= 760) {
      const stage = canvasElement.value?.getBoundingClientRect();
      if (stage && nodeRect.bottom > panelRect.top - 12 &&
          nodeRect.top < panelRect.bottom && nodeRect.right > panelRect.left) {
        const visibleTop = stage.top + 42;
        const desired = panelRect.top - nodeRect.bottom - 18;
        const dy = Math.max(desired, visibleTop - nodeRect.top);
        if (dy < -2) {
          const current = getViewport();
          await setViewport({ ...current, y: current.y + dy }, { duration: 180 });
        }
      }
      return;
    }
    if (nodeRect.right > panelRect.left - 16 && nodeRect.left < panelRect.right && nodeRect.bottom > panelRect.top && nodeRect.top < panelRect.bottom) {
      const current = getViewport();
      await setViewport({ ...current, x: current.x - (nodeRect.right - panelRect.left + 24) }, { duration: 180 });
    }
    return;
  }

  // In B the Inspector is a sibling grid column, so opening it reduces the
  // actual visible stage width. Keep the selected node inside that stage by
  // translating the viewport rather than changing the node's saved position.
  const stageRect = canvasElement.value?.getBoundingClientRect();
  if (!stageRect) return;
  const padding = 18;
  const dx = nodeRect.right > stageRect.right - padding
    ? stageRect.right - padding - nodeRect.right
    : nodeRect.left < stageRect.left + padding ? stageRect.left + padding - nodeRect.left : 0;
  const dy = nodeRect.bottom > stageRect.bottom - padding
    ? stageRect.bottom - padding - nodeRect.bottom
    : nodeRect.top < stageRect.top + padding ? stageRect.top + padding - nodeRect.top : 0;
  if (dx !== 0 || dy !== 0) {
    const current = getViewport();
    await setViewport({ ...current, x: current.x + dx, y: current.y + dy }, { duration: 180 });
  }
}
function requestDelete(kind: "node" | "project", id: string) {
  if (deleteDialog.value?.open) return;
  deleteKind.value = kind;
  deleteTargetId.value = id;
  openProjectMenuId.value = "";
  deleteDialog.value?.showModal();
  void nextTick(() => deleteCancelButton.value?.focus());
}
function cancelDeleteDialog() { if (!deleteCommitPending) deleteDialog.value?.close(); }
function cancelProjectDialog() { if (!projectCommitPending) projectDialog.value?.close(); }
function confirmDelete() {
  // A synchronous mutation with a brief retained native top-layer prevents a
  // second double-click from selecting cards/Canvas behind the closing dialog.
  if (!deleteDialog.value?.open || !deleteTargetId.value || deleteCommitPending) return;
  deleteCommitPending = true;
  // Keep the native top-layer backdrop briefly during a double-click. If we
  // close on the first click, the second click can activate a card underneath.
  deleteCloseTimer = setTimeout(() => {
    deleteDialog.value?.close();
    deleteCommitPending = false;
    deleteTargetId.value = "";
    deleteCloseTimer = undefined;
  }, 240);
  if (deleteKind.value === "node") {
    nodes.value = nodes.value.filter(node => node.id !== deleteTargetId.value);
    edges.value = edges.value.filter(edge => edge.source !== deleteTargetId.value && edge.target !== deleteTargetId.value);
    if (selectedNodeId.value === deleteTargetId.value) { selectedNodeId.value = null; inspectorOpen.value = false; }
  } else {
    const target = previewProjects.value.find(project => project.id === deleteTargetId.value);
    if (target) target.deleted = true;
    if (target) trashOpen.value = true;
    openProjectMenuId.value = "";
  }
}
function openProjectDialog(mode: "create" | "rename", id = "") {
  if (projectDialog.value?.open) return;
  projectDialogMode.value = mode;
  projectTargetId.value = id;
  projectDraft.value = mode === "rename" ? previewProjects.value.find(project => project.id === id)?.name || "" : "";
  openProjectMenuId.value = "";
  projectDialog.value?.showModal();
  void nextTick(() => { projectNameInput.value?.focus(); if (mode === "rename") projectNameInput.value?.select(); });
}
function confirmProject() {
  if (!projectDialog.value?.open || projectCommitPending) return;
  const name = projectDraft.value.trim();
  if (!name) return;
  projectCommitPending = true;
  projectCloseTimer = setTimeout(() => {
    projectDialog.value?.close();
    projectCommitPending = false;
    projectTargetId.value = "";
    projectDraft.value = "";
    projectCloseTimer = undefined;
  }, 240);
  if (projectDialogMode.value === "rename") {
    const target = previewProjects.value.find(project => project.id === projectTargetId.value);
    if (target && !target.deleted) {
      const oldName = target.name;
      target.name = name;
      if (activeProjectName.value === oldName) activeProjectName.value = name;
    }
  } else {
    const posters = ["/designPreview/flowerFrame.svg", "/designPreview/portraitFrame.svg", "/designPreview/alleyFrame.svg", "/designPreview/streetFrame.svg"];
    const number = ++createdProjectCount;
    previewProjects.value.unshift({ id: "preview-project-created-" + number, name, description: "Dự án mới · chỉ trong bộ nhớ", poster: posters[(number - 1) % posters.length], deleted: false });
    libraryMode.value = "projects";
    libraryQuery.value = "";
  }
}
function restoreProject(id: string) {
  const target = previewProjects.value.find(project => project.id === id && project.deleted);
  if (target) { target.deleted = false; libraryMode.value = "projects"; libraryQuery.value = ""; }
}
function onDialogBackdrop(event: MouseEvent, kind: "delete" | "project") {
  if (event.target !== event.currentTarget) return;
  if ((kind === "delete" && deleteCommitPending) || (kind === "project" && projectCommitPending)) return;
  const rect = (event.currentTarget as HTMLDialogElement).getBoundingClientRect();
  const clickedOutside = event.clientX < rect.left || event.clientX > rect.right ||
    event.clientY < rect.top || event.clientY > rect.bottom;
  if (!clickedOutside) return;
  if (kind === "delete") deleteDialog.value?.close();
  else projectDialog.value?.close();
}
function onDialogCancel(event: Event, kind: "delete" | "project") {
  if ((kind === "delete" && deleteCommitPending) || (kind === "project" && projectCommitPending)) {
    event.preventDefault();
  }
}
function outsideClick(event: PointerEvent) {
  const element = event.target as Element;
  if (paletteOpen.value && !element.closest(".previewPalette,.previewCreateButton,.dockCreate,.sceneCreate")) paletteOpen.value = false;
  if (dockMoreOpen.value && !element.closest(".previewDockMenu,.dockMore")) dockMoreOpen.value = false;
  if (openProjectMenuId.value && !element.closest(".projectCardMenu")) openProjectMenuId.value = "";
}
watch(scenario, applyScenario);
watch(mediaMode, () => { nodes.value = nodes.value.map(node => ({ ...node, data: { ...node.data, demo: mediaMode.value === "demo" && node.type !== "text" } })); fitSoon(); });
watch([inspectorOpen, variant, selectedNodeId], () => { void nextTick(ensureNodeVisible); });
onMounted(() => { applyScenario(); document.addEventListener("pointerdown", outsideClick, true); });
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", outsideClick, true);
  for (const item of composerReferences.value) if (item.objectUrl) URL.revokeObjectURL(item.src);
  if (projectCloseTimer) clearTimeout(projectCloseTimer);
  if (deleteCloseTimer) clearTimeout(deleteCloseTimer);
});
</script>

<style src="./designPreview.css"></style>
