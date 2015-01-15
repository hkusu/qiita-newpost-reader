'use strict';

angular.module('qiitaNewpostReader')
  .controller('MainCtrl', function ($scope, $http, $ionicLoading, $ionicModal, $ionicScrollDelegate, $timeout) {
    // ページ下部の infinite-scroll を表示するか否かのフラグ
    $scope.initial_loaded = false;

    $scope.load = function(_page){
      // Loading... を表示
      $ionicLoading.show({
        template: 'Loading...',
        noBackdrop: true
      });
      $http.get('https://qiita.com/api/v1/items?per_page=10&page=' + _page).success(function(items) {
        // 初期表示とページ上部のリフレッシュの際はクリア
        if(_page == 1){
          $scope.items= [];
        }
        // 既存の内容に結合
        $scope.items = $scope.items.concat(items);
        // Loading... を隠す
        $ionicLoading.hide();
        // ページ上部のリフレッシュ表示を終了
        $scope.$broadcast('scroll.refreshComplete');
        // 初期表示で infinite-scroll が有効になってしまうので、数秒まつ
        $timeout(function() {
          $scope.initial_loaded = true;
        }, 1000);
        // 数秒まってからページ下部の infinite-scroll を終了する。でないとループしてしまうため
        $timeout(function() {
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }, 3000);

        $scope.next_page = _page + 1;
      });
    };

    // 初期表示
    $scope.load(1);

    // 記事詳細 モーダル表示
    $scope.modal_title = "";
    $scope.modal_body = ""; // bodyの方はマークダウン(コードハイライト付き)＆絵文字を表示
    $ionicModal.fromTemplateUrl("post.modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function(modal) {
      $scope.post_modal = modal;
    });
    $scope.openPostModal = function(index) {
      $scope.modal_title = $scope.items[index].title;
      $scope.modal_body = $scope.items[index].raw_body;
      // スクロールをTOPへ。ハンドルを指定して、背後の ScrollView がTOPにスクロールされないようにする
      $ionicScrollDelegate.$getByHandle('subScroll').scrollTop();
      $scope.post_modal.show();
    };
    $scope.closePostModal = function() {
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
    $scope.openInfoModal = function(index) {
      $scope.info_modal.show();
    };
    $scope.closeInfoModal = function() {
      $scope.info_modal.hide();
    };
    $scope.$on("$destroy", function() {
      $scope.info_modal.remove();
    });
  });
