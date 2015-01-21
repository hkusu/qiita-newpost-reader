'use strict';

angular.module('qiitaNewpostReader')
  .controller('MainCtrl', function ($scope, $http, $ionicLoading, $ionicModal, $ionicScrollDelegate) {
    $scope.next_page = 1;
    $scope.search_keyword = "";
    $scope.message = "";
    var api_url = "";

    // 初期表示は View の infinite-scroll から呼ばれる
    $scope.load = function(_page, _keyword){
      // Loading... を表示
      $ionicLoading.show({
        template: 'Loading...',
        noBackdrop: true
      });
      if (_keyword == ""){
        api_url = 'https://qiita.com/api/v1/items?';
        $scope.search_keyword = "";
      } else {
        api_url = 'https://qiita.com/api/v1/search?' + 'q=' + _keyword + '&';
      }
      $http.get(api_url + 'per_page=20&page=' + _page).success(function(items) {
        // 結果が 0 件の場合
        if (items.length==0) {
          $ionicLoading.show({
            template: '検索に一致する投稿はありません。',
            noBackdrop: true,
            duration: 2000
          });
          return;
        }
        // 初期表示とページ上部のリフレッシュの際はクリア
        if (_page == 1){
          $scope.items= [];
        }
        // 既存の内容に結合
        $scope.items = $scope.items.concat(items);
        // Loading... を隠す
        $ionicLoading.hide();
        // ページ上部のリフレッシュ表示を終了
        $scope.$broadcast('scroll.refreshComplete');
        // ページ下部の infinite-scroll を終了
        $scope.$broadcast('scroll.infiniteScrollComplete');
        // ページ上部にメッセージを表示
        if (_keyword == ""){
          $scope.message = ""
        } else {
          $scope.message = '"' + _keyword + '"' + ' での検索結果'
        }
        $scope.next_page = _page + 1;
      });
    };

    // 検索ボタン
    $scope.doSearch = function(_keyword){
      // 一覧のスクロールをTOPへ
      $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
      $scope.next_page = 1;
      $scope.search_keyword = _keyword;
      $scope.load($scope.next_page, $scope.search_keyword);
      $scope.search_modal.hide();
    };

    // 記事詳細 モーダル表示
    $scope.modal_body = "";
    $ionicModal.fromTemplateUrl("post.modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function(modal) {
      $scope.post_modal = modal;
    });
    $scope.openPostModal = function(index) {
      // マークダウン(コードハイライトつき)＆絵文字を表示。初期時に値が無いとエラーになるので他の項目とは別途で
      $scope.modal_body = $scope.items[index].raw_body;
      $scope.item = $scope.items[index];
      // モーダルのスクロールをTOPへ。ハンドルを指定して、背後の ScrollView がTOPにスクロールされないようにする
      $ionicScrollDelegate.$getByHandle('subScroll').scrollTop();
      $scope.post_modal.show();
    };
    var displayed = false;
    $scope.closePostModal = function(show_message) {
      // メッセージを表示
      if (show_message && !displayed) {
        $ionicLoading.show({
          template: '画面のどこかをタッチして閉じることもできます。',
          noBackdrop: true,
          duration: 2000
        });
        displayed = true;
      }
      $scope.post_modal.hide();
    };
    $scope.$on("$destroy", function() {
      $scope.post_modal.remove();
    });

    // info モーダル表示
    $ionicModal.fromTemplateUrl("info.modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function(modal) {
      $scope.info_modal = modal;
    });
    $scope.openInfoModal = function() {
      $scope.info_modal.show();
    };
    $scope.closeInfoModal = function() {
      $scope.info_modal.hide();
    };
    $scope.$on("$destroy", function() {
      $scope.info_modal.remove();
    });

    // 検索 モーダル表示
    $ionicModal.fromTemplateUrl("search.modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function(modal) {
      $scope.search_modal = modal;
    });
    $scope.openSearchModal = function() {
      $scope.search_modal.show();
    };
    $scope.closeSearchModal = function() {
      $scope.search_modal.hide();
    };
    $scope.$on("$destroy", function() {
      $scope.search_modal.remove();
    });
  });
